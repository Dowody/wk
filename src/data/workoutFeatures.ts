import { WorkoutLog } from './workoutHistory'

export interface JournalEntry {
  id: string
  date: string
  mood: '😄' | '😐' | '😫'
  note: string
  workoutId?: string // Optional reference to a workout
}

export interface WorkoutGoal {
  id: string
  type: 'streak' | 'reps' | 'weight' | 'workouts' | 'superset'
  target: number
  current: number
  completed: boolean
  deadline?: string
  exercise?: string // For exercise-specific goals
  description: string
  badge?: string // Emoji badge for the goal
}

export interface Superset {
  id: string
  name: string
  exercises: {
    name: string
    sets: number
    reps: number
    restTime: number // in seconds
  }[]
  restBetweenRounds: number // in seconds
  rounds: number
}

export interface NutritionLog {
  date: string
  water: number // glasses
  calories?: number
  protein?: number // grams
  carbs?: number // grams
  fat?: number // grams
  notes?: string
}

// Calculate goal progress
export function calculateGoalProgress(
  goal: WorkoutGoal,
  workoutLogs: WorkoutLog[]
): number {
  switch (goal.type) {
    case 'streak':
      return calculateStreak(workoutLogs)
    case 'reps':
      return calculateTotalReps(workoutLogs, goal.exercise)
    case 'weight':
      return calculateMaxWeight(workoutLogs, goal.exercise)
    case 'workouts':
      return workoutLogs.length
    case 'superset':
      return calculateSupersetCompletions(workoutLogs)
    default:
      return 0
  }
}

// Calculate workout streak
function calculateStreak(workoutLogs: WorkoutLog[]): number {
  if (!workoutLogs.length) return 0

  const sortedLogs = [...workoutLogs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let streak = 1
  for (let i = sortedLogs.length - 1; i > 0; i--) {
    const currentDate = new Date(sortedLogs[i].date)
    const previousDate = new Date(sortedLogs[i - 1].date)
    const dayDifference = Math.floor(
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (dayDifference === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// Calculate total reps for an exercise
function calculateTotalReps(workoutLogs: WorkoutLog[], exercise?: string): number {
  return workoutLogs.reduce((total, log) => {
    return total + log.exercises.reduce((exerciseTotal, ex) => {
      if (!exercise || ex.name === exercise) {
        return exerciseTotal + ex.sets.reduce((setTotal, set) => 
          setTotal + (set.completed ? set.reps : 0), 0
        )
      }
      return exerciseTotal
    }, 0)
  }, 0)
}

// Calculate max weight for an exercise
function calculateMaxWeight(workoutLogs: WorkoutLog[], exercise?: string): number {
  return workoutLogs.reduce((max, log) => {
    return Math.max(max, ...log.exercises
      .filter(ex => !exercise || ex.name === exercise)
      .flatMap(ex => ex.sets.map(set => set.weight))
    )
  }, 0)
}

// Calculate completed supersets
function calculateSupersetCompletions(workoutLogs: WorkoutLog[]): number {
  return workoutLogs.reduce((total, log) => {
    return total + log.exercises.reduce((exerciseTotal, ex) => {
      return exerciseTotal + (ex.notes?.includes('superset') ? 1 : 0)
    }, 0)
  }, 0)
}

// Default goals
export const defaultGoals: WorkoutGoal[] = [
  {
    id: 'streak-7',
    type: 'streak',
    target: 7,
    current: 0,
    completed: false,
    description: 'Workout 7 days in a row',
    badge: '🔥',
  },
  {
    id: 'workouts-100',
    type: 'workouts',
    target: 100,
    current: 0,
    completed: false,
    description: 'Complete 100 workouts',
    badge: '🏋️',
  },
  {
    id: 'reps-1000',
    type: 'reps',
    target: 1000,
    current: 0,
    completed: false,
    description: 'Do 1000 total reps',
    badge: '💪',
  },
]

// Default supersets
export const defaultSupersets: Superset[] = [
  {
    id: 'upper-body',
    name: 'Upper Body Blast',
    exercises: [
      { name: 'Push-ups', sets: 3, reps: 12, restTime: 30 },
      { name: 'Pull-ups', sets: 3, reps: 8, restTime: 30 },
    ],
    restBetweenRounds: 60,
    rounds: 3,
  },
  {
    id: 'leg-day',
    name: 'Leg Day Circuit',
    exercises: [
      { name: 'Squats', sets: 3, reps: 15, restTime: 45 },
      { name: 'Lunges', sets: 3, reps: 12, restTime: 45 },
    ],
    restBetweenRounds: 90,
    rounds: 3,
  },
] 