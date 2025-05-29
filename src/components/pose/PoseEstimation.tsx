import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';
import { usePoseDetection } from '../../hooks/usePoseDetectionNew';

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
    isDetecting 
  } = usePoseDetection({
    webcamRef,
    canvasRef,
    onRepComplete,
    onFormFeedback,
    exerciseType
  });

  useEffect(() => {
    if (isActive && !isDetecting) {
      startPoseDetection();
    } else if (!isActive && isDetecting) {
      stopPoseDetection();
    }
  }, [isActive, isDetecting, startPoseDetection, stopPoseDetection]);

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
    </div>
  );
};

export default PoseEstimation;