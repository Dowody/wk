export type Exercise = {
  id?: string
  name: string
  sets: number
  reps: number
  weight?: number
}

export type WorkoutDay = {
  id: string
  name: string
  exercises: Exercise[]
  isCompleted: boolean
}

export type WeeklyPlan = {
  id: string
  days: WorkoutDay[]
}

export type WorkoutPlan = {
  id: string
  name: string
  exercises: Exercise[]
}
