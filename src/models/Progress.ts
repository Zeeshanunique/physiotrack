// Frontend Progress interface - no mongoose dependencies
export interface IProgress {
  _id?: string;
  userId: string;
  exerciseId: string;
  date: Date;
  reps: number;
  sets: number;
  weight?: number;
  duration: number;
  formScore: number;
  notes?: string;
}