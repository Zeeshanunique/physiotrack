import { useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { mockMediaPipeService as mediaPipeService } from '../services/mockMediaPipeService';

// Define the interface for the hook parameters
interface UsePoseDetectionProps {
  webcamRef: React.RefObject<Webcam>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onRepComplete: () => void;
  onFormFeedback: (message: string, type: 'success' | 'warning' | 'error') => void;
  exerciseType: string;
}

// Custom hook for pose detection with MediaPipe BlazePose and BiLSTM
export const usePoseDetection = ({
  webcamRef,
  canvasRef,
  onRepComplete,
  onFormFeedback,
  exerciseType
}: UsePoseDetectionProps) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [formScore, setFormScore] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('neutral');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize MediaPipe service
  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        await mediaPipeService.initialize();
        setIsInitialized(true);
        console.log('MediaPipe service initialized');
      } catch (error) {
        console.error('Failed to initialize MediaPipe:', error);
      }
    };

    if (!isInitialized) {
      initializeMediaPipe();
    }

    return () => {
      if (isDetecting) {
        mediaPipeService.stopCamera();
      }
    };
  }, [isInitialized, isDetecting]);

  // Update metrics from MediaPipe service
  useEffect(() => {
    if (!isDetecting || !isInitialized) return;

    let lastFeedbackTime = 0;
    const updateMetrics = () => {
      const newRepCount = mediaPipeService.getRepCount();
      const newFormScore = mediaPipeService.getCurrentFormScore();
      const newPhase = mediaPipeService.getCurrentPhase();

      // Check for rep completion
      if (newRepCount > repCount) {
        setRepCount(newRepCount);
        onRepComplete();
      }

      setFormScore(newFormScore);
      setCurrentPhase(newPhase);

      // Provide form feedback based on score
      if (newFormScore > 0) {
        const averageScore = mediaPipeService.getAverageFormScore();
        const now = Date.now();
        
        // Throttle feedback to every 2 seconds
        if (now - lastFeedbackTime > 2000) {
          if (averageScore >= 80) {
            onFormFeedback('Excellent form! Keep it up!', 'success');
          } else if (averageScore >= 60) {
            onFormFeedback('Good form, maintain your posture', 'success');
          } else if (averageScore >= 40) {
            onFormFeedback('Form needs improvement - check your posture', 'warning');
          } else {
            onFormFeedback('Poor form detected - slow down and focus on technique', 'error');
          }
          lastFeedbackTime = now;
        }
      }
    };

    const intervalId = setInterval(updateMetrics, 100); // Update every 100ms

    return () => clearInterval(intervalId);
  }, [isDetecting, isInitialized, repCount, onRepComplete, onFormFeedback]);

  // Start pose detection with MediaPipe
  const startPoseDetection = useCallback(async () => {
    if (isDetecting || !isInitialized) return;

    try {
      setIsDetecting(true);
      mediaPipeService.resetMetrics();

      // Get video element from webcam ref
      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;

      if (video && canvas) {
        // Setup MediaPipe camera with video and canvas
        mediaPipeService.setupCamera(video, canvas);
        mediaPipeService.startCamera();
        
        console.log(`Started pose detection for ${exerciseType}`);
      } else {
        console.error('Video or canvas element not found');
        setIsDetecting(false);
      }
    } catch (error) {
      console.error('Error starting pose detection:', error);
      setIsDetecting(false);
    }
  }, [isDetecting, isInitialized, webcamRef, canvasRef, exerciseType]);

  // Stop pose detection
  const stopPoseDetection = useCallback(() => {
    if (!isDetecting) return;

    try {
      mediaPipeService.stopCamera();
      setIsDetecting(false);
      console.log('Stopped pose detection');
    } catch (error) {
      console.error('Error stopping pose detection:', error);
    }
  }, [isDetecting]);

  // Reset exercise metrics
  const resetMetrics = useCallback(() => {
    if (isInitialized) {
      mediaPipeService.resetMetrics();
    }
    setRepCount(0);
    setFormScore(0);
    setCurrentPhase('neutral');
  }, [isInitialized]);

  // Train BiLSTM model with exercise data
  const trainModel = useCallback(async (trainingData: any[]) => {
    if (!isInitialized) return;
    
    try {
      await mediaPipeService.trainBiLSTM(trainingData);
      console.log('BiLSTM model training completed');
    } catch (error) {
      console.error('Error training BiLSTM model:', error);
    }
  }, [isInitialized]);

  return {
    startPoseDetection,
    stopPoseDetection,
    isDetecting,
    isInitialized,
    repCount,
    formScore,
    currentPhase,
    resetMetrics,
    trainModel
  };
};

export default usePoseDetection;
