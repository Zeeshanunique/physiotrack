export interface Exercise {
  id: string;
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

export const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Shoulder External Rotation',
    description: 'Strengthens the rotator cuff muscles to improve shoulder stability and function.',
    duration: 10,
    difficulty: 'beginner',
    bodyPart: 'upper',
    imageUrl: 'https://images.pexels.com/photos/4056529/pexels-photo-4056529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    instructions: [
      'Stand with your elbow bent at 90 degrees, upper arm against your side',
      'Slowly rotate your forearm outward, keeping your elbow at your side',
      'Hold for 2 seconds at the end position',
      'Slowly return to the starting position',
      'Repeat for the recommended repetitions'
    ],
    targetRepetitions: 12,
    restBetweenSets: 60,
    sets: 3
  },
  {
    id: '2',
    name: 'Knee Extension',
    description: 'Strengthens the quadriceps muscles to support knee stability and function.',
    duration: 15,
    difficulty: 'beginner',
    bodyPart: 'lower',
    imageUrl: 'https://images.pexels.com/photos/6111616/pexels-photo-6111616.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    instructions: [
      'Sit on a chair with your back straight',
      'Slowly extend one leg until it is straight',
      'Hold for 3 seconds',
      'Slowly lower your leg back to the starting position',
      'Repeat for the recommended repetitions, then switch legs'
    ],
    targetRepetitions: 15,
    restBetweenSets: 45,
    sets: 3
  },
  {
    id: '3',
    name: 'Wall Slides',
    description: 'Improves shoulder mobility and scapular control.',
    duration: 12,
    difficulty: 'intermediate',
    bodyPart: 'upper',
    imageUrl: 'https://images.pexels.com/photos/6551133/pexels-photo-6551133.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    instructions: [
      'Stand with your back against a wall, feet shoulder-width apart',
      'Place your arms against the wall in a "W" position',
      'Slowly slide your arms upward while keeping them against the wall',
      'Return to the starting position in a controlled manner',
      'Repeat for the recommended repetitions'
    ],
    targetRepetitions: 10,
    restBetweenSets: 60,
    sets: 3
  },
  {
    id: '4',
    name: 'Hip Bridge',
    description: 'Strengthens the glutes and lower back to improve posture and reduce back pain.',
    duration: 10,
    difficulty: 'beginner',
    bodyPart: 'lower',
    imageUrl: 'https://images.pexels.com/photos/6550839/pexels-photo-6550839.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor',
      'Tighten your abdominal and gluteal muscles',
      'Raise your hips to create a straight line from your knees to shoulders',
      'Hold for 2-3 seconds at the top',
      'Lower your hips back to the starting position',
      'Repeat for the recommended repetitions'
    ],
    targetRepetitions: 15,
    restBetweenSets: 45,
    sets: 3
  },
  {
    id: '5',
    name: 'Wrist Flexion and Extension',
    description: 'Improves wrist mobility and strength to reduce risk of repetitive strain injuries.',
    duration: 8,
    difficulty: 'beginner',
    bodyPart: 'upper',
    imageUrl: 'https://images.pexels.com/photos/4498564/pexels-photo-4498564.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    instructions: [
      'Sit with your forearm resting on a table, wrist at the edge',
      'Hold a light weight in your hand',
      'Slowly bend your wrist upward (extension)',
      'Return to neutral, then bend your wrist downward (flexion)',
      'Return to neutral and repeat for the recommended repetitions'
    ],
    targetRepetitions: 15,
    restBetweenSets: 30,
    sets: 3
  },
  {
    id: '6',
    name: 'Single Leg Balance',
    description: 'Improves balance, stability and proprioception for lower extremity rehabilitation.',
    duration: 10,
    difficulty: 'intermediate',
    bodyPart: 'lower',
    imageUrl: 'https://images.pexels.com/photos/8032728/pexels-photo-8032728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    instructions: [
      'Stand near a counter or sturdy chair for support if needed',
      'Shift your weight to one foot and lift the other foot off the ground',
      'Maintain your balance for 30 seconds',
      'Return to the starting position and switch legs',
      'Repeat for the recommended repetitions'
    ],
    targetRepetitions: 5,
    restBetweenSets: 30,
    sets: 2
  }
];