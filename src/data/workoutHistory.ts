import { Exercise, WorkoutDay } from './workoutPlan'

export interface WorkoutLog {
  date: string
  day: string
  focus: string
  exercises: {
    name: string
    sets: {
      weight: number
      reps: number
      completed: boolean
    }[]
    notes?: string
  }[]
  mood?: '😄' | '😐' | '😫'
  notes?: string
}

export interface BodyMeasurement {
  id?: string
  date: string
  weight: number
  waist?: number
  chest?: number
  arms?: number
  body_fat?: number
}

export interface WorkoutGoal {
  id: string
  type: 'streak' | 'reps' | 'weight' | 'workouts'
  target: number
  current: number
  completed: boolean
  deadline?: string
}

// Calculate days since last workout for a muscle group
export function getDaysSinceLastWorkout(
  workoutLogs: WorkoutLog[],
  muscleGroup: string
): number {
  const lastWorkout = workoutLogs
    .filter(log => 
      log.exercises.some(ex => 
        ex.name.toLowerCase().includes(muscleGroup.toLowerCase())
      )
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  if (!lastWorkout) return Infinity

  const lastDate = new Date(lastWorkout.date)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - lastDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Generate workout recommendations
export function getWorkoutRecommendations(
  workoutLogs: WorkoutLog[],
  workoutPlan: WorkoutDay[]
): string[] {
  const recommendations: string[] = []
  const muscleGroups = ['legs', 'chest', 'back', 'shoulders', 'arms']

  // Check for missed muscle groups
  muscleGroups.forEach(group => {
    const daysSince = getDaysSinceLastWorkout(workoutLogs, group)
    if (daysSince >= 4) {
      recommendations.push(
        `You haven't trained ${group} in ${daysSince} days. How about a ${group} workout tomorrow?`
      )
    }
  })

  // Check for workout streaks
  const recentWorkouts = workoutLogs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)

  const streak = recentWorkouts.filter(log => 
    new Date(log.date).getTime() >= new Date().getTime() - 7 * 24 * 60 * 60 * 1000
  ).length

  if (streak >= 5) {
    recommendations.push(
      `Great job! You've worked out ${streak} days in the last week. Keep it up!`
    )
  }

  return recommendations
}

// Calculate progress metrics
export function calculateProgress(workoutLogs: WorkoutLog[]) {
  const progress = {
    totalWorkouts: workoutLogs.length,
    totalSets: workoutLogs.reduce((sum, log) => 
      sum + log.exercises.reduce((setSum, ex) => setSum + ex.sets.length, 0), 0
    ),
    totalReps: workoutLogs.reduce((sum, log) => 
      sum + log.exercises.reduce((repSum, ex) => 
        repSum + ex.sets.reduce((s, set) => s + (set.completed ? set.reps : 0), 0), 0
      ), 0
    ),
    maxWeight: workoutLogs.reduce((max, log) => 
      Math.max(max, ...log.exercises.flatMap(ex => 
        ex.sets.map(set => set.weight)
      )), 0
    ),
  }

  return progress
} 