import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Play, Pause } from 'lucide-react'
import { Superset, defaultSupersets } from '../data/workoutFeatures'
import RestTimer from './RestTimer'

interface SupersetModeProps {
  onComplete: (superset: Superset) => void
}

export default function SupersetMode({ onComplete }: SupersetModeProps) {
  const [supersets, setSupersets] = useState<Superset[]>(defaultSupersets)
  const [activeSuperset, setActiveSuperset] = useState<Superset | null>(null)
  const [currentRound, setCurrentRound] = useState(1)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [isResting, setIsResting] = useState(false)

  const startSuperset = (superset: Superset) => {
    setActiveSuperset(superset)
    setCurrentRound(1)
    setCurrentExercise(0)
    setIsResting(false)
  }

  const completeExercise = () => {
    if (!activeSuperset) return

    if (currentExercise < activeSuperset.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1)
    } else if (currentRound < activeSuperset.rounds) {
      setCurrentRound(currentRound + 1)
      setCurrentExercise(0)
      setIsResting(true)
    } else {
      onComplete(activeSuperset)
      setActiveSuperset(null)
    }
  }

  const addSuperset = () => {
    const newSuperset: Superset = {
      id: Date.now().toString(),
      name: 'New Superset',
      exercises: [
        { name: 'Exercise 1', sets: 3, reps: 10, restTime: 30 },
        { name: 'Exercise 2', sets: 3, reps: 10, restTime: 30 },
      ],
      restBetweenRounds: 60,
      rounds: 3,
    }
    setSupersets([...supersets, newSuperset])
  }

  const removeSuperset = (id: string) => {
    setSupersets(supersets.filter((s) => s.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Active Superset */}
      {activeSuperset && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-card p-4"
        >
          <h3 className="font-medium text-foreground">
            {activeSuperset.name} - Round {currentRound}/{activeSuperset.rounds}
          </h3>

          {isResting ? (
            <RestTimer
              duration={activeSuperset.restBetweenRounds}
              onComplete={() => setIsResting(false)}
              autoStart
            />
          ) : (
            <div className="mt-4 space-y-4">
              {activeSuperset.exercises.map((exercise, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-md border border-border bg-background p-3 ${
                    index === currentExercise ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">
                        {exercise.name}
                      </h4>
                      <p className="text-sm text-foreground-muted">
                        {exercise.sets} sets × {exercise.reps} reps
                      </p>
                    </div>
                    {index === currentExercise && (
                      <button
                        onClick={completeExercise}
                        className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90"
                      >
                        <Play className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Superset List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-border bg-card p-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">Supersets</h3>
          <button
            onClick={addSuperset}
            className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {supersets.map((superset, index) => (
            <motion.div
              key={superset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between rounded-md border border-border bg-background p-3"
            >
              <div>
                <h4 className="font-medium text-foreground">{superset.name}</h4>
                <p className="text-sm text-foreground-muted">
                  {superset.exercises.length} exercises × {superset.rounds} rounds
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startSuperset(superset)}
                  className="rounded-full bg-accent p-2 text-accent-foreground hover:bg-accent/80"
                >
                  <Play className="h-5 w-5" />
                </button>
                <button
                  onClick={() => removeSuperset(superset.id)}
                  className="rounded-full p-1 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
} 