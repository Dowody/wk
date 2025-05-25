import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Moon,
  Sun,
  Clock,
  Plus,
  Trash2,
  Save,
  ChevronRight,
  Bell,
  User,
  Lock,
} from 'lucide-react'
import { workoutPlan } from '../data/workoutPlan'

interface Exercise {
  name: string
  sets: number
  reps: number
  weight?: number
  notes?: string
}

interface WorkoutDay {
  day: string
  focus: string
  exercises: Exercise[]
}

export default function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [workoutTime, setWorkoutTime] = useState('18:00')
  const [customExercises, setCustomExercises] = useState<Exercise[]>([])
  const [newExercise, setNewExercise] = useState<Exercise>({
    name: '',
    sets: 3,
    reps: 10,
  })
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('workoutSettings')
    if (savedSettings) {
      const { isDarkMode, workoutTime, customExercises } = JSON.parse(savedSettings)
      setIsDarkMode(isDarkMode)
      setWorkoutTime(workoutTime)
      setCustomExercises(customExercises)
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(
      'workoutSettings',
      JSON.stringify({
        isDarkMode,
        workoutTime,
        customExercises,
      })
    )
  }, [isDarkMode, workoutTime, customExercises])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const addCustomExercise = () => {
    if (newExercise.name.trim()) {
      setCustomExercises([...customExercises, newExercise])
      setNewExercise({ name: '', sets: 3, reps: 10 })
    }
  }

  const removeCustomExercise = (index: number) => {
    setCustomExercises(customExercises.filter((_, i) => i !== index))
  }

  const settingsSections = [
    {
      icon: isDarkMode ? Moon : Sun,
      title: 'Theme',
      description: 'Toggle between light and dark mode',
      action: (
        <button
          onClick={toggleTheme}
          className="rounded-full bg-accent p-2 text-accent-foreground hover:bg-accent/80"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      ),
    },
    {
      icon: Clock,
      title: 'Workout Time',
      description: 'Set your preferred workout time',
      action: (
        <input
          type="time"
          value={workoutTime}
          onChange={(e) => setWorkoutTime(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Settings Sections */}
      <div className="space-y-4">
        {settingsSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-accent/10 p-2">
                <section.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{section.title}</h3>
                <p className="text-sm text-foreground-muted">
                  {section.description}
                </p>
              </div>
            </div>
            {section.action}
          </motion.div>
        ))}
      </div>

      {/* Custom Exercises */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-medium text-foreground">Custom Exercises</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Add your own exercises to the workout plan
        </p>

        <div className="mt-4 space-y-4">
          {customExercises.map((exercise, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-md border border-border bg-background p-3"
            >
              <div>
                <h4 className="font-medium text-foreground">{exercise.name}</h4>
                <p className="text-sm text-foreground-muted">
                  {exercise.sets} sets × {exercise.reps} reps
                  {exercise.weight ? ` @ ${exercise.weight}kg` : ''}
                </p>
              </div>
              <button
                onClick={() => removeCustomExercise(index)}
                className="rounded-full p-1 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}

          <div className="flex items-center gap-4 rounded-md border border-border bg-background p-3">
            <input
              type="text"
              value={newExercise.name}
              onChange={(e) =>
                setNewExercise({ ...newExercise, name: e.target.value })
              }
              placeholder="Exercise name"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-foreground"
            />
            <input
              type="number"
              value={newExercise.sets}
              onChange={(e) =>
                setNewExercise({ ...newExercise, sets: parseInt(e.target.value) })
              }
              placeholder="Sets"
              className="w-20 rounded-md border border-border bg-background px-3 py-2 text-foreground"
            />
            <input
              type="number"
              value={newExercise.reps}
              onChange={(e) =>
                setNewExercise({ ...newExercise, reps: parseInt(e.target.value) })
              }
              placeholder="Reps"
              className="w-20 rounded-md border border-border bg-background px-3 py-2 text-foreground"
            />
            <button
              onClick={addCustomExercise}
              className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Export/Import */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-medium text-foreground">Data Management</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Export or import your workout data
        </p>

        <div className="mt-4 flex gap-4">
          <button
            onClick={() => {
              const data = {
                workoutPlan,
                customExercises,
                settings: {
                  isDarkMode,
                  workoutTime,
                },
              }
              const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json',
              })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'workout-data.json'
              a.click()
            }}
            className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-accent-foreground hover:bg-accent/90"
          >
            <Save className="h-4 w-4" />
            Export Data
          </button>
          <button
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.json'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    try {
                      const data = JSON.parse(e.target?.result as string)
                      console.log('Imported data:', data)
                    } catch (error) {
                      console.error('Error importing data:', error)
                    }
                  }
                  reader.readAsText(file)
                }
              }
              input.click()
            }}
            className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-foreground hover:bg-accent/50"
          >
            <ChevronRight className="h-4 w-4" />
            Import Data
          </button>
        </div>
      </div>
    </div>
  )
}
