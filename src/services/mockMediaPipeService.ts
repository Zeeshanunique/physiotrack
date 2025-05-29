// Mock MediaPipe service for testing and development
export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface ExerciseMetrics {
  repCount: number;
  formScore: number;
  currentPhase: string;
  exerciseType: string;
  confidence: number;
  feedback: string[];
}

class MockMediaPipeService {
  private isInitialized = false;
  private repCount = 0;
  private formScore = 75;
  private currentPhase: 'up' | 'down' | 'neutral' = 'neutral';
  private formHistory: number[] = [];

  async initialize(): Promise<void> {
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.isInitialized = true;
    console.log('Mock MediaPipe service initialized');
  }

  setupCamera(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): void {
    console.log('Mock camera setup completed');
  }

  startCamera(): void {
    console.log('Mock camera started');
    // Simulate random rep counting and form scoring
    this.simulateExerciseData();
  }

  stopCamera(): void {
    console.log('Mock camera stopped');
  }

  private simulateExerciseData(): void {
    // Simulate exercise data updates every 2 seconds
    setInterval(() => {
      if (Math.random() > 0.7) {
        this.repCount++;
        this.currentPhase = this.currentPhase === 'up' ? 'down' : 'up';
      }
      
      // Random form score between 60-95
      this.formScore = 60 + Math.random() * 35;
      this.formHistory.push(this.formScore);
      
      if (this.formHistory.length > 100) {
        this.formHistory.shift();
      }
    }, 2000);
  }

  getRepCount(): number {
    return this.repCount;
  }

  getCurrentFormScore(): number {
    return this.formScore;
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
    this.formScore = 0;
    this.formHistory = [];
  }

  async trainBiLSTM(trainingData: any[]): Promise<void> {
    console.log('Mock BiLSTM training completed with', trainingData.length, 'samples');
  }

  dispose(): void {
    console.log('Mock MediaPipe service disposed');
  }
}

export const mockMediaPipeService = new MockMediaPipeService();
export default mockMediaPipeService;
