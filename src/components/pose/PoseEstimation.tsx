import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, Activity, Target, TrendingUp, RotateCcw } from 'lucide-react';
import { usePoseDetection } from '../../hooks/usePoseDetection';

interface PoseEstimationProps {
  isActive: boolean;
  onRepComplete: () => void;
  onFormFeedback: (message: string, type: 'success' | 'warning' | 'error') => void;
  exerciseType: string;
}

const PoseEstimation: React.FC<PoseEstimationProps> = ({
  isActive,
  onRepComplete,
  onFormFeedback,
  exerciseType
}) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const { 
    startPoseDetection, 
    stopPoseDetection, 
    isDetecting,
    isInitialized,
    repCount,
    formScore,
    currentPhase,
    resetMetrics
  } = usePoseDetection({
    webcamRef,
    canvasRef,
    onRepComplete,
    onFormFeedback,
    exerciseType
  });

  useEffect(() => {
    if (isActive && !isDetecting && isInitialized) {
      startPoseDetection();
    } else if (!isActive && isDetecting) {
      stopPoseDetection();
    }
  }, [isActive, isDetecting, isInitialized, startPoseDetection, stopPoseDetection]);

  // Handle exercise reset
  const handleReset = () => {
    resetMetrics();
  };

  // Get form score color based on score
  const getFormScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  // Get phase indicator color
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'up': return 'text-blue-400';
      case 'down': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  // Check camera permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);
      } catch (err) {
        console.error("Camera permission denied:", err);
        setHasPermission(false);
      }
    };
    
    checkPermissions();
  }, []);

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-white text-center">
        <Camera className="h-16 w-16 mb-4 text-error-500" />
        <h3 className="text-xl font-bold mb-4">Camera Access Required</h3>
        <p className="mb-6 text-neutral-300">
          Please allow camera access to use the pose estimation features. You can change this in your browser settings.
        </p>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <Webcam
        ref={webcamRef}
        mirrored={true}
        audio={false}
        className="absolute top-0 left-0 w-full h-full object-contain"
        videoConstraints={{
          facingMode: "user",
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-contain"
      />
      
      {/* AI Analytics Overlay */}
      {isInitialized && (
        <div className="absolute top-4 left-4 right-4 z-10">
          {/* Status Indicator */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isDetecting ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-white text-sm font-medium">
                {isDetecting ? 'Tracking Active' : 'Tracking Paused'}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Reset</span>
            </button>
          </div>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-3 gap-3">
            {/* Rep Counter */}
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center space-x-2 mb-1">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-300 uppercase tracking-wide">Reps</span>
              </div>
              <div className="text-2xl font-bold text-white">{repCount}</div>
            </div>

            {/* Form Score */}
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-300 uppercase tracking-wide">Form</span>
              </div>
              <div className={`text-2xl font-bold ${getFormScoreColor(formScore)}`}>
                {formScore}%
              </div>
            </div>

            {/* Current Phase */}
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-300 uppercase tracking-wide">Phase</span>
              </div>
              <div className={`text-lg font-semibold capitalize ${getPhaseColor(currentPhase)}`}>
                {currentPhase || 'Ready'}
              </div>
            </div>
          </div>

          {/* Exercise Type Display */}
          <div className="mt-3 bg-black/50 backdrop-blur-sm rounded-lg p-2 border border-white/20">
            <div className="text-center text-sm text-gray-300">
              Exercise: <span className="text-white font-medium capitalize">{exerciseType}</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Initializing AI Model...</p>
            <p className="text-sm text-gray-300 mt-2">Setting up MediaPipe and BiLSTM</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoseEstimation;