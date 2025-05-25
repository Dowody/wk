import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Download, Upload, Dumbbell, ChevronRight } from 'lucide-react'

interface Exercise {
  name: string
  sets: number
  reps: number
}

export default function ExerciseManager() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [newExercise, setNewExercise] = useState<Exercise>({
    name: '',
    sets: 3,
    reps: 10,
  })

  const addExercise = () => {
    if (newExercise.name.trim()) {
      setExercises([...exercises, newExercise])
      setNewExercise({ name: '', sets: 3, reps: 10 })
    }
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const exportData = () => {
    const data = {
      exercises,
      timestamp: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'workout-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.exercises) {
            setExercises(data.exercises)
          }
        } catch (error) {
          console.error('Error importing data:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Custom Exercises */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-xl border border-border bg-card shadow-lg"
      >
        <div className="border-b border-border bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Custom Exercises</h3>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            {/* Add New Exercise */}
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center">
              <input
                type="text"
                value={newExercise.name}
                onChange={(e) =>
                  setNewExercise({ ...newExercise, name: e.target.value })
                }
                placeholder="Exercise name"
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex gap-4">
                <input
                  type="number"
                  value={newExercise.sets}
                  onChange={(e) =>
                    setNewExercise({
                      ...newExercise,
                      sets: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Sets"
                  className="w-24 rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="number"
                  value={newExercise.reps}
                  onChange={(e) =>
                    setNewExercise({
                      ...newExercise,
                      reps: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Reps"
                  className="w-24 rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={addExercise}
                  className="rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-all hover:border-primary/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-accent p-2">
                      <Dumbbell className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{exercise.name}</h4>
                      <p className="text-sm text-foreground-muted">
                        {exercise.sets} sets × {exercise.reps} reps
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-foreground-muted transition-transform group-hover:translate-x-1" />
                    <button
                      onClick={() => removeExercise(index)}
                      className="rounded-lg p-2 text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-xl border border-border bg-card shadow-lg"
      >
        <div className="border-b border-border bg-card/50 p-4">
          <h3 className="text-lg font-medium text-foreground">Data Management</h3>
          <p className="mt-1 text-sm text-foreground-muted">
            Export or import your workout data
          </p>
        </div>

        <div className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              onClick={exportData}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30"
            >
              <Download className="h-5 w-5" />
              Export Data
            </button>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 hover:shadow-accent/30">
              <Upload className="h-5 w-5" />
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 