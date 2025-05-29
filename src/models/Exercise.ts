// Frontend Exercise interface - no mongoose dependencies
export interface IExercise {
  _id?: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  bodyPart: 'upper' | 'lower' | 'core' | 'full';
  imageUrl: string;
  videoUrl?: string;
  instructions: string[];
  targetRepetitions: number;
  restBetweenSets: number;
  sets: number;
}