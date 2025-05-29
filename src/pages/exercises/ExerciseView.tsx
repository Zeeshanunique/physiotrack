import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, AlertCircle, CheckCircle, Camera } from 'lucide-react';
import { mockExercises } from '../../data/mockExercises';
import PoseEstimation from '../../components/pose/PoseEstimation';

const ExerciseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const exercise = mockExercises.find((ex) => ex.id === id);
  
  const [isActive, setIsActive] = useState(false);
  const [currentRep, setCurrentRep] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'warning' | 'error'>('success');
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear timers on unmount
    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, []);

  const handleStartExercise = () => {
    setIsActive(true);
    setShowInstructions(false);
  };

  const handlePauseExercise = () => {
    setIsActive(false);
    setFeedback('Exercise paused. Press play to continue.');
    setFeedbackType('warning');
  };

  const startRestTimer = () => {
    setIsResting(true);
    setRestTime(exercise?.restBetweenSets || 60);
    
    restTimerRef.current = setInterval(() => {
      setRestTime((prev) => {
        if (prev <= 1) {
          if (restTimerRef.current) {
            clearInterval(restTimerRef.current);
          }
          setIsResting(false);
          setFeedback('Get ready for the next set!');
          setFeedbackType('success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRepComplete = () => {
    if (!exercise) return;
    
    setCurrentRep((prev) => {
      const newRep = prev + 1;
      
      // Check if set is complete
      if (newRep >= exercise.targetRepetitions) {
        // Check if all sets are complete
        if (currentSet >= exercise.sets) {
          setFeedback('Great job! You\'ve completed all sets!');
          setFeedbackType('success');
          setIsActive(false);
          return 0;
        } else {
          // Start rest timer between sets
          setCurrentSet((prevSet) => prevSet + 1);
          startRestTimer();
          setFeedback(`Set ${currentSet} complete! Rest for ${exercise.restBetweenSets} seconds.`);
          setFeedbackType('success');
          return 0;
        }
      } else {
        // Provide feedback during reps
        if (newRep === Math.floor(exercise.targetRepetitions / 2)) {
          setFeedback('You\'re halfway there! Keep going!');
          setFeedbackType('success');
        } else if (newRep === exercise.targetRepetitions - 1) {
          setFeedback('One more rep to go!');
          setFeedbackType('success');
        }
        return newRep;
      }
    });
  };

  const handleFormFeedback = (message: string, type: 'success' | 'warning' | 'error') => {
    setFeedback(message);
    setFeedbackType(type);
  };

  if (!exercise) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-error-500" />
        <h3 className="mt-2 text-lg font-medium text-neutral-900">Exercise not found</h3>
        <p className="mt-1 text-sm text-neutral-500">
          The exercise you're looking for doesn't exist.
        </p>
        <button
          type="button"
          onClick={() => navigate('/exercises')}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Exercises
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/exercises')}
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Exercises
          </button>
          <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
            {exercise.name}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {exercise.duration} min • {exercise.bodyPart.charAt(0).toUpperCase() + exercise.bodyPart.slice(1)} Body • {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)} Level
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main content - Camera feed and pose estimation */}
        <div className="lg:col-span-2 bg-neutral-900 rounded-lg overflow-hidden shadow-lg relative">
          {showInstructions ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-white text-center">
              <Camera className="h-16 w-16 mb-4 text-primary-500" />
              <h3 className="text-xl font-bold mb-4">Ready to start {exercise.name}</h3>
              <p className="mb-6 text-neutral-300">
                Position yourself in front of the camera so your full body is visible. We'll track your movements to ensure proper form.
              </p>
              <button
                type="button"
                onClick={handleStartExercise}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Exercise
              </button>
            </div>
          ) : (
            <>
              <PoseEstimation 
                isActive={isActive} 
                onRepComplete={handleRepComplete}
                onFormFeedback={handleFormFeedback}
                exerciseType={exercise.bodyPart}
              />
              
              {/* Feedback overlay */}
              {feedback && (
                <div className={`absolute bottom-0 left-0 right-0 p-4 ${
                  feedbackType === 'success' ? 'bg-success-500' : 
                  feedbackType === 'warning' ? 'bg-warning-500' : 
                  'bg-error-500'
                } text-white font-medium text-center`}>
                  {feedback}
                </div>
              )}
              
              {/* Controls overlay */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <div className="bg-black bg-opacity-50 rounded-lg px-4 py-2 text-white font-medium">
                  Set {currentSet} of {exercise.sets} • Rep {currentRep} of {exercise.targetRepetitions}
                </div>
                <button
                  type="button"
                  onClick={isActive ? handlePauseExercise : handleStartExercise}
                  className="bg-primary-600 hover:bg-primary-700 rounded-full p-2 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Rest timer overlay */}
              {isResting && (
                <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Rest Time</h3>
                  <p className="text-5xl font-bold mb-4">{restTime}</p>
                  <p className="text-lg">Get ready for set {currentSet} of {exercise.sets}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar - Exercise details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Instructions</h3>
            <ol className="space-y-4 mb-6">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center mr-3 mt-0.5 text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-neutral-700">{instruction}</span>
                </li>
              ))}
            </ol>
            
            <div className="border-t border-neutral-200 pt-4">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Exercise Details</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Sets</dt>
                  <dd className="mt-1 text-sm text-neutral-900">{exercise.sets}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Repetitions</dt>
                  <dd className="mt-1 text-sm text-neutral-900">{exercise.targetRepetitions} per set</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Rest</dt>
                  <dd className="mt-1 text-sm text-neutral-900">{exercise.restBetweenSets} seconds</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Duration</dt>
                  <dd className="mt-1 text-sm text-neutral-900">~{exercise.duration} minutes</dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-neutral-200 pt-4 mt-4">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Tips for Success</h3>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Maintain proper form throughout the entire movement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Breathe naturally and don't hold your breath</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>If you feel pain (not discomfort), stop immediately</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Keep movements slow and controlled</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseView;