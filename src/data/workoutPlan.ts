export interface Exercise {
  name: string
  sets: number
  reps: number
  weight?: number
  notes?: string
  completed?: boolean
}

export interface WorkoutDay {
  day: string
  focus: string
  exercises: Exercise[]
}

export const workoutPlan: WorkoutDay[] = [
  {
    day: 'Monday',
    focus: 'Push',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8, weight: 0 },
      { name: 'Overhead Press', sets: 3, reps: 10, weight: 0 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 12, weight: 0 },
      { name: 'Lateral Raises', sets: 3, reps: 15, weight: 0 },
      { name: 'Tricep Pushdowns', sets: 3, reps: 12, weight: 0 },
    ],
  },
  {
    day: 'Tuesday',
    focus: 'Pull',
    exercises: [
      { name: 'Pull-ups', sets: 4, reps: 8, weight: 0 },
      { name: 'Barbell Rows', sets: 4, reps: 10, weight: 0 },
      { name: 'Face Pulls', sets: 3, reps: 15, weight: 0 },
      { name: 'Bicep Curls', sets: 3, reps: 12, weight: 0 },
      { name: 'Hammer Curls', sets: 3, reps: 12, weight: 0 },
    ],
  },
  {
    day: 'Wednesday',
    focus: 'Legs',
    exercises: [
      { name: 'Squats', sets: 4, reps: 8, weight: 0 },
      { name: 'Romanian Deadlifts', sets: 4, reps: 10, weight: 0 },
      { name: 'Leg Press', sets: 3, reps: 12, weight: 0 },
      { name: 'Calf Raises', sets: 4, reps: 15, weight: 0 },
      { name: 'Leg Extensions', sets: 3, reps: 12, weight: 0 },
    ],
  },
  {
    day: 'Thursday',
    focus: 'Core',
    exercises: [
      { name: 'Plank', sets: 3, reps: 1, notes: 'Hold for 60 seconds' },
      { name: 'Russian Twists', sets: 3, reps: 20, weight: 0 },
      { name: 'Leg Raises', sets: 3, reps: 15 },
      { name: 'Cable Woodchops', sets: 3, reps: 12, weight: 0 },
      { name: 'Ab Wheel Rollouts', sets: 3, reps: 10 },
    ],
  },
  {
    day: 'Friday',
    focus: 'Push',
    exercises: [
      { name: 'Incline Bench Press', sets: 4, reps: 8, weight: 0 },
      { name: 'Military Press', sets: 3, reps: 10, weight: 0 },
      { name: 'Dumbbell Flyes', sets: 3, reps: 12, weight: 0 },
      { name: 'Front Raises', sets: 3, reps: 15, weight: 0 },
      { name: 'Skull Crushers', sets: 3, reps: 12, weight: 0 },
    ],
  },
  {
    day: 'Saturday',
    focus: 'Pull',
    exercises: [
      { name: 'Deadlifts', sets: 4, reps: 6, weight: 0 },
      { name: 'Lat Pulldowns', sets: 4, reps: 10, weight: 0 },
      { name: 'Seated Rows', sets: 3, reps: 12, weight: 0 },
      { name: 'Preacher Curls', sets: 3, reps: 12, weight: 0 },
      { name: 'Reverse Flyes', sets: 3, reps: 15, weight: 0 },
    ],
  },
  {
    day: 'Sunday',
    focus: 'Rest',
    exercises: [],
  },
] 