import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Activity, BarChart } from 'lucide-react';
import { Exercise } from '../../data/mockExercises';

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-success-100 text-success-800';
      case 'intermediate':
        return 'bg-warning-100 text-warning-800';
      case 'advanced':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getBodyPartIcon = (bodyPart: string) => {
    switch (bodyPart) {
      case 'upper':
        return '💪';
      case 'lower':
        return '🦵';
      case 'core':
        return '⭐';
      case 'full':
        return '👤';
      default:
        return '👤';
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-md">
      <div className="h-48 overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          src={exercise.imageUrl}
          alt={exercise.name}
        />
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-neutral-900 truncate">{exercise.name}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
            {exercise.difficulty}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{exercise.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-neutral-500">
            <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-400" />
            {exercise.duration} min
          </div>
          <div className="flex items-center text-sm text-neutral-500">
            <Activity className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-400" />
            {exercise.sets} sets
          </div>
          <div className="flex items-center text-sm text-neutral-500">
            <BarChart className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-400" />
            {exercise.targetRepetitions} reps
          </div>
        </div>
        <div className="mt-5 flex justify-between items-center">
          <span className="text-sm text-neutral-500">
            <span className="mr-1">{getBodyPartIcon(exercise.bodyPart)}</span>
            {exercise.bodyPart.charAt(0).toUpperCase() + exercise.bodyPart.slice(1)} body
          </span>
          <Link
            to={`/exercise/${exercise.id}`}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Start Exercise
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;