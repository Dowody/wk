import { useState, useEffect } from 'react'
import { WeeklyPlan } from '../types/workout'
import { defaultWeeklyPlan } from '../data/defaultWorkout'

export function useWorkoutPlan() {
  const [plan, setPlan] = useState<WeeklyPlan>(() => {
    const saved = localStorage.getItem('workoutPlan')
    return saved ? JSON.parse(saved) : defaultWeeklyPlan
  })

  useEffect(() => {
    localStorage.setItem('workoutPlan', JSON.stringify(plan))
  }, [plan])

  const toggleWorkoutComplete = (dayId: string) => {
    setPlan(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId ? { ...day, isCompleted: !day.isCompleted } : day
      )
    }))
  }

  return { plan, toggleWorkoutComplete }
}
