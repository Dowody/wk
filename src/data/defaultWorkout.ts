import { WeeklyPlan } from '../types/workout'

export const defaultWeeklyPlan: WeeklyPlan = {
  id: 'default',
  days: [
    {
      id: 'push',
      name: 'Push Day',
      isCompleted: false,
      exercises: [
        { id: 'bench', name: 'Bench Press', sets: 4, reps: 8 },
        { id: 'ohp', name: 'Overhead Press', sets: 3, reps: 10 },
        { id: 'triceps', name: 'Tricep Extensions', sets: 3, reps: 12 }
      ]
    },
    {
      id: 'pull',
      name: 'Pull Day',
      isCompleted: false,
      exercises: [
        { id: 'rows', name: 'Barbell Rows', sets: 4, reps: 8 },
        { id: 'pullups', name: 'Pull-ups', sets: 3, reps: 10 },
        { id: 'biceps', name: 'Bicep Curls', sets: 3, reps: 12 }
      ]
    },
    {
      id: 'legs',
      name: 'Legs Day',
      isCompleted: false,
      exercises: [
        { id: 'squats', name: 'Squats', sets: 4, reps: 8 },
        { id: 'deadlifts', name: 'Deadlifts', sets: 3, reps: 8 },
        { id: 'lunges', name: 'Lunges', sets: 3, reps: 12 }
      ]
    },
    {
      id: 'core',
      name: 'Core Day',
      isCompleted: false,
      exercises: [
        { id: 'planks', name: 'Planks', sets: 3, reps: 60 },
        { id: 'crunches', name: 'Crunches', sets: 3, reps: 15 },
        { id: 'russian', name: 'Russian Twists', sets: 3, reps: 20 }
      ]
    },
    {
      id: 'rest1',
      name: 'Rest Day',
      isCompleted: false,
      exercises: []
    }
  ]
}
