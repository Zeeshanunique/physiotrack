import { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { PoseDetection } from '@tensorflow-models/pose-detection';

interface UseBiLSTMPoseModelProps {
  sequenceLength: number;
  inputFeatures: number;
  hiddenUnits: number;
}

interface PoseSequence {
  keypoints: Array<{x: number, y: number, score: number}[]>;
  timestamps: number[];
}

export const useBiLSTMPoseModel = ({
  sequenceLength = 30,  // Default to 30 frames (~1 second at 30fps)
  inputFeatures = 34,   // 17 keypoints × 2 coordinates (x, y)
  hiddenUnits = 64      // Size of LSTM cell state
}: Partial<UseBiLSTMPoseModelProps> = {}) => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [accuracy, setAccuracy] = useState<number>(0);
  
  // Store pose sequences for training
  const sequencesRef = useRef<{[key: string]: PoseSequence[]}>({});
  
  // Initialize the BiLSTM model
  useEffect(() => {
    const initModel = async () => {
      try {
        // Check if we have a saved model
        try {
          const loadedModel = await tf.loadLayersModel('indexeddb://physio-track-bilstm-model');
          console.log('Loaded existing model from IndexedDB');
          setModel(loadedModel);
          setIsModelReady(true);
          return;
        } catch (e) {
          console.log('No saved model found, creating new model');
        }

        // Create a new BiLSTM model
        const newModel = createBiLSTMModel(sequenceLength, inputFeatures, hiddenUnits);
        setModel(newModel);
        setIsModelReady(true);
      } catch (error) {
        console.error('Error initializing BiLSTM model:', error);
      }
    };

    initModel();
  }, [sequenceLength, inputFeatures, hiddenUnits]);

  // Function to create a BiLSTM model
  const createBiLSTMModel = (seqLength: number, features: number, units: number): tf.LayersModel => {
    const input = tf.input({shape: [seqLength, features]});
    
    // Create a Bidirectional LSTM layer
    const bilstm = tf.layers.bidirectional({
      layer: tf.layers.lstm({
        units: units,
        returnSequences: true
      }),
      mergeMode: 'concat',
      inputShape: [seqLength, features]
    });
    
    // Add a second Bidirectional LSTM layer
    const bilstm2 = tf.layers.bidirectional({
      layer: tf.layers.lstm({
        units: units / 2,
        returnSequences: false
      }),
      mergeMode: 'concat'
    });
    
    // Dense layers for classification
    const dense1 = tf.layers.dense({units: 32, activation: 'relu'});
    const dropout = tf.layers.dropout({rate: 0.3});
    const dense2 = tf.layers.dense({units: 16, activation: 'relu'});
    const output = tf.layers.dense({units: 5, activation: 'softmax'}); // 5 exercise classes for example
    
    // Connect the layers
    const lstm1 = bilstm.apply(input);
    const lstm2 = bilstm2.apply(lstm1);
    const dense1Out = dense1.apply(lstm2);
    const dropoutOut = dropout.apply(dense1Out);
    const dense2Out = dense2.apply(dropoutOut);
    const outputLayer = output.apply(dense2Out);
    
    // Create and compile the model
    const model = tf.model({inputs: input, outputs: outputLayer as tf.SymbolicTensor});
    
    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    return model;
  };

  // Convert pose keypoints to normalized features
  const normalizePoseKeypoints = (pose: PoseDetection.Pose): number[] => {
    if (!pose.keypoints) return [];
    
    const features: number[] = [];
    
    // Get bounding box for normalization
    const keypoints = pose.keypoints;
    const xValues = keypoints.map(kp => kp.x);
    const yValues = keypoints.map(kp => kp.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    const width = maxX - minX;
    const height = maxY - minY;
    const size = Math.max(width, height);
    
    // Center point for normalization
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    
    // Normalize each keypoint
    for (const keypoint of keypoints) {
      // Normalize coordinates to [-1, 1] range
      const x = (keypoint.x - centerX) / size;
      const y = (keypoint.y - centerY) / size;
      
      // Add normalized coordinates to feature vector
      features.push(x, y);
      
      // Could also add confidence scores if available
      // features.push(keypoint.score || 0);
    }
    
    return features;
  };

  // Add a pose sequence for training data
  const addPoseSequenceForTraining = (label: string, pose: PoseDetection.Pose) => {
    const timestamp = Date.now();
    const features = normalizePoseKeypoints(pose);
    
    // Initialize label sequence if it doesn't exist
    if (!sequencesRef.current[label]) {
      sequencesRef.current[label] = [];
    }
    
    // Find the current active sequence or create a new one
    let currentSequence = sequencesRef.current[label].find(
      seq => seq.keypoints.length < sequenceLength
    );
    
    if (!currentSequence) {
      currentSequence = { keypoints: [], timestamps: [] };
      sequencesRef.current[label].push(currentSequence);
    }
    
    // Add the keypoints and timestamp
    if (features.length > 0) {
      // Reshape the features into keypoint format for storage
      const reshapedKeypoints = [];
      for (let i = 0; i < features.length; i += 2) {
        reshapedKeypoints.push({
          x: features[i],
          y: features[i + 1],
          score: 1.0 // Using 1.0 as these are already filtered keypoints
        });
      }
      
      currentSequence.keypoints.push(reshapedKeypoints);
      currentSequence.timestamps.push(timestamp);
    }
  };

  // Train the model with collected sequences
  const trainModel = async (exerciseClasses: string[]) => {
    if (!model || Object.keys(sequencesRef.current).length === 0) return;
    
    setIsTraining(true);
    
    try {
      // Prepare training data
      const sequences: number[][][] = [];
      const labels: number[] = [];
      
      // Process each exercise class
      exerciseClasses.forEach((className, classIndex) => {
        if (!sequencesRef.current[className]) return;
        
        sequencesRef.current[className].forEach(sequence => {
          if (sequence.keypoints.length === sequenceLength) {
            // Convert sequence to features
            const sequenceFeatures = sequence.keypoints.map(keypoints => {
              const features: number[] = [];
              keypoints.forEach(kp => {
                features.push(kp.x, kp.y);
              });
              return features;
            });
            
            sequences.push(sequenceFeatures);
            labels.push(classIndex);
          }
        });
      });
      
      if (sequences.length === 0) {
        console.error('No valid sequences for training');
        setIsTraining(false);
        return;
      }
      
      // Convert to tensors
      const xs = tf.tensor3d(sequences);
      const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), exerciseClasses.length);
      
      // Train the model
      const history = await model.fit(xs, ys, {
        epochs: 50,
        batchSize: 16,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (logs?.acc) {
              setAccuracy(logs.acc);
            }
            console.log(`Epoch ${epoch+1}: accuracy = ${logs?.acc?.toFixed(4)}`);
          }
        }
      });
      
      // Save the model
      await model.save('indexeddb://physio-track-bilstm-model');
      
      // Cleanup
      xs.dispose();
      ys.dispose();
      
      setIsTraining(false);
      return history;
    } catch (error) {
      console.error('Error training model:', error);
      setIsTraining(false);
      throw error;
    }
  };

  // Predict exercise class from a pose sequence
  const predictExercise = async (poseSequence: PoseDetection.Pose[]): Promise<{label: string, confidence: number} | null> => {
    if (!model || !isModelReady || poseSequence.length < sequenceLength) return null;
    
    try {
      // Convert pose sequence to features
      const sequenceFeatures = poseSequence.map(pose => normalizePoseKeypoints(pose));
      
      // Make prediction
      const input = tf.tensor3d([sequenceFeatures]);
      const prediction = model.predict(input) as tf.Tensor;
      
      // Get the predicted class
      const predictionData = await prediction.data();
      const predictionArray = Array.from(predictionData);
      const maxPredictionIndex = predictionArray.indexOf(Math.max(...predictionArray));
      const confidence = predictionArray[maxPredictionIndex];
      
      // Cleanup
      input.dispose();
      prediction.dispose();
      
      // Map index back to label (in real app, would have a mapping)
      const exerciseClasses = ['shoulder_external_rotation', 'knee_extension', 'wall_slides', 'hip_bridge', 'other'];
      
      return {
        label: exerciseClasses[maxPredictionIndex],
        confidence
      };
    } catch (error) {
      console.error('Error predicting exercise:', error);
      return null;
    }
  };

  return {
    model,
    isModelReady,
    isTraining,
    accuracy,
    addPoseSequenceForTraining,
    trainModel,
    predictExercise
  };
};