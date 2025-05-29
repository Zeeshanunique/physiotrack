// Enhanced MediaPipe service with BlazePose and BiLSTM integration
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import * as tf from '@tensorflow/tfjs';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseResult {
  poseLandmarks?: PoseLandmark[];
  worldLandmarks?: PoseLandmark[];
}

export interface ExerciseMetrics {
  repCount: number;
  formScore: number;
  currentPhase: string;
  exerciseType: string;
  confidence: number;
  feedback: string[];
}

export interface BiLSTMPrediction {
  exerciseType: string;
  confidence: number;
  repPhase: 'up' | 'down' | 'neutral';
  formQuality: number;
}

class MediaPipeService {
  private pose: Pose | null = null;
  private camera: Camera | null = null;
  private isInitialized = false;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  
  // BiLSTM model and sequence tracking
  private biLSTMModel: tf.LayersModel | null = null;
  private poseSequence: PoseLandmark[][] = [];
  private sequenceLength = 30; // 30 frames for temporal analysis
    // Exercise tracking state
  private repCount = 0;
  private currentPhase: 'up' | 'down' | 'neutral' = 'neutral';
  private lastFormScore = 0;
  private formHistory: number[] = [];

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize MediaPipe Pose
      this.pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      this.pose.setOptions({
        modelComplexity: 2, // 0, 1, or 2. Higher = more accurate but slower
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.pose.onResults(this.onPoseResults.bind(this));

      // Initialize BiLSTM model
      await this.initializeBiLSTMModel();
      
      this.isInitialized = true;
      console.log('MediaPipe service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MediaPipe service:', error);
      throw error;
    }
  }

  private async initializeBiLSTMModel(): Promise<void> {
    try {
      // Try to load existing model
      this.biLSTMModel = await tf.loadLayersModel('indexeddb://physio-bilstm-model');
      console.log('Loaded existing BiLSTM model');
    } catch (error) {
      // Create new model if none exists
      console.log('Creating new BiLSTM model');
      this.biLSTMModel = this.createBiLSTMModel();
      await this.biLSTMModel.save('indexeddb://physio-bilstm-model');
    }
  }

  private createBiLSTMModel(): tf.LayersModel {
    const model = tf.sequential();
    
    // Input shape: [batchSize, sequenceLength, features]
    // Features: 33 landmarks × 3 coordinates (x, y, z) = 99 features
    model.add(tf.layers.bidirectional({
      layer: tf.layers.lstm({
        units: 64,
        returnSequences: true,
        dropout: 0.2,
        recurrentDropout: 0.2
      }),
      inputShape: [this.sequenceLength, 99]
    }));

    model.add(tf.layers.bidirectional({
      layer: tf.layers.lstm({
        units: 32,
        returnSequences: false,
        dropout: 0.2,
        recurrentDropout: 0.2
      })
    }));

    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    // Output layers for multi-task learning
    const exerciseTypeOutput = tf.layers.dense({ 
      units: 10, // Number of exercise types
      activation: 'softmax',
      name: 'exercise_type'
    });
    
    const repPhaseOutput = tf.layers.dense({
      units: 3, // up, down, neutral
      activation: 'softmax',
      name: 'rep_phase'
    });
    
    const formQualityOutput = tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
      name: 'form_quality'
    });    // Multi-output model
    const mainOutput = model.output as tf.SymbolicTensor;
    const outputs = [
      exerciseTypeOutput.apply(mainOutput) as tf.SymbolicTensor,
      repPhaseOutput.apply(mainOutput) as tf.SymbolicTensor,
      formQualityOutput.apply(mainOutput) as tf.SymbolicTensor
    ];

    const multiOutputModel = tf.model({
      inputs: model.input,
      outputs: outputs
    });    multiOutputModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: {
        exercise_type: 'categoricalCrossentropy',
        rep_phase: 'categoricalCrossentropy',
        form_quality: 'meanSquaredError'
      },
      metrics: ['accuracy']
    });

    return multiOutputModel;
  }

  setupCamera(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): void {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        if (this.pose) {
          await this.pose.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480
    });
  }

  startCamera(): void {
    if (this.camera) {
      this.camera.start();
    }
  }

  stopCamera(): void {
    if (this.camera) {
      this.camera.stop();
    }
  }

  private onPoseResults(results: PoseResult): void {
    if (!this.canvas || !this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (results.poseLandmarks) {
      // Draw pose landmarks and connections
      drawConnectors(this.ctx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 4
      });
      drawLandmarks(this.ctx, results.poseLandmarks, {
        color: '#FF0000',
        lineWidth: 2,
        radius: 6
      });

      // Add to pose sequence for BiLSTM analysis
      this.addToPoseSequence(results.poseLandmarks);
        // Perform real-time analysis
      this.analyzePose();
    }
  }

  private addToPoseSequence(landmarks: PoseLandmark[]): void {
    this.poseSequence.push([...landmarks]);
    
    // Maintain sequence length
    if (this.poseSequence.length > this.sequenceLength) {
      this.poseSequence.shift();
    }
  }

  private async analyzePose(): Promise<void> {
    if (this.poseSequence.length < this.sequenceLength || !this.biLSTMModel) {
      return;
    }

    try {
      // Prepare input tensor for BiLSTM
      const inputTensor = this.prepareBiLSTMInput(this.poseSequence);
      
      // Get predictions
      const predictions = this.biLSTMModel.predict(inputTensor) as tf.Tensor[];
        const exerciseTypePred = await predictions[0].data() as Float32Array;
      const repPhasePred = await predictions[1].data() as Float32Array;
      const formQualityPred = await predictions[2].data() as Float32Array;

      // Process predictions
      const prediction: BiLSTMPrediction = {
        exerciseType: this.getExerciseTypeFromPrediction(exerciseTypePred),
        confidence: Math.max(...Array.from(exerciseTypePred)),
        repPhase: this.getRepPhaseFromPrediction(repPhasePred),
        formQuality: formQualityPred[0]
      };      // Update exercise metrics
      this.updateExerciseMetrics(prediction);

      // Cleanup tensors
      inputTensor.dispose();
      predictions.forEach(tensor => tensor.dispose());
    } catch (error) {
      console.error('Error in pose analysis:', error);
    }
  }

  private prepareBiLSTMInput(poseSequence: PoseLandmark[][]): tf.Tensor {
    const data: number[][][] = [];
    
    for (const frame of poseSequence) {
      const frameData: number[] = [];
      for (const landmark of frame) {
        frameData.push(landmark.x, landmark.y, landmark.z || 0);
      }
      data.push([frameData]);
    }

    return tf.tensor3d(data);
  }

  private getExerciseTypeFromPrediction(prediction: Float32Array): string {
    const exerciseTypes = ['push-up', 'squat', 'bicep-curl', 'plank', 'lunges', 'jumping-jacks', 'burpees', 'mountain-climbers', 'sit-ups', 'other'];
    const maxIndex = prediction.indexOf(Math.max(...Array.from(prediction)));
    return exerciseTypes[maxIndex] || 'unknown';
  }

  private getRepPhaseFromPrediction(prediction: Float32Array): 'up' | 'down' | 'neutral' {
    const phases: ('up' | 'down' | 'neutral')[] = ['up', 'down', 'neutral'];
    const maxIndex = prediction.indexOf(Math.max(...Array.from(prediction)));
    return phases[maxIndex] || 'neutral';
  }
  private updateExerciseMetrics(prediction: BiLSTMPrediction): void {
    // Update rep count based on phase transitions
    if (this.currentPhase !== prediction.repPhase) {
      if (this.currentPhase === 'down' && prediction.repPhase === 'up') {
        this.repCount++;
      }
      this.currentPhase = prediction.repPhase;
    }

    // Update form score
    this.lastFormScore = prediction.formQuality * 100;
    this.formHistory.push(this.lastFormScore);
    
    // Keep form history manageable
    if (this.formHistory.length > 100) {
      this.formHistory.shift();
    }
  }
  // Public methods for getting exercise metrics
  getRepCount(): number {
    return this.repCount;
  }

  getCurrentFormScore(): number {
    return this.lastFormScore;
  }

  getAverageFormScore(): number {
    if (this.formHistory.length === 0) return 0;
    return this.formHistory.reduce((sum, score) => sum + score, 0) / this.formHistory.length;
  }

  getCurrentPhase(): string {
    return this.currentPhase;
  }

  resetMetrics(): void {
    this.repCount = 0;
    this.currentPhase = 'neutral';
    this.lastFormScore = 0;
    this.formHistory = [];
    this.poseSequence = [];
  }

  // Training methods for BiLSTM
  async trainBiLSTM(trainingData: any[]): Promise<void> {
    if (!this.biLSTMModel) return;

    // Prepare training data
    const { inputs, outputs } = this.prepareTrainingData(trainingData);
    
    // Train the model
    await this.biLSTMModel.fit(inputs, outputs, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss}, accuracy = ${logs?.acc}`);
        }
      }
    });

    // Save the updated model
    await this.biLSTMModel.save('indexeddb://physio-bilstm-model');
  }
  private prepareTrainingData(_trainingData: any[]): { inputs: tf.Tensor, outputs: tf.Tensor[] } {
    // Implementation depends on your training data format
    // This is a placeholder that should be implemented based on your specific needs
    const inputData: number[][][] = [];
    const exerciseTypeLabels: number[][] = [];
    const repPhaseLabels: number[][] = [];
    const formQualityLabels: number[] = [];

    // Process training data...
    // (Implementation specific to your data format)

    return {
      inputs: tf.tensor3d(inputData),
      outputs: [
        tf.tensor2d(exerciseTypeLabels),
        tf.tensor2d(repPhaseLabels),
        tf.tensor1d(formQualityLabels)
      ]
    };
  }

  dispose(): void {
    if (this.pose) {
      this.pose.close();
    }
    if (this.camera) {
      this.camera.stop();
    }
    if (this.biLSTMModel) {
      this.biLSTMModel.dispose();
    }
  }
}

export const mediaPipeService = new MediaPipeService();
export default mediaPipeService;
