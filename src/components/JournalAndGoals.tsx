import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trophy, Target, CheckCircle2 } from 'lucide-react'
import { JournalEntry, WorkoutGoal, defaultGoals } from '../data/workoutFeatures'

interface JournalAndGoalsProps {
  workoutLogs: any[] // Replace with proper type
  onAddJournalEntry: (entry: JournalEntry) => void
  onUpdateGoal: (goal: WorkoutGoal) => void
}

export default function JournalAndGoals({
  workoutLogs,
  onAddJournalEntry,
  onUpdateGoal,
}: JournalAndGoalsProps) {
  const [goals, setGoals] = useState<WorkoutGoal[]>(defaultGoals)
  const [newEntry, setNewEntry] = useState<Partial<JournalEntry>>({
    mood: '😄',
    note: '',
  })

  const addJournalEntry = () => {
    if (newEntry.note?.trim()) {
      onAddJournalEntry({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        mood: newEntry.mood || '😄',
        note: newEntry.note,
      })
      setNewEntry({ mood: '😄', note: '' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Journal Entry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card p-4"
      >
        <h3 className="font-medium text-foreground">Daily Journal</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          How was your workout today?
        </p>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setNewEntry({ ...newEntry, mood: '😄' })}
              className={`rounded-full p-2 text-2xl ${
                newEntry.mood === '😄' ? 'bg-accent/20' : 'hover:bg-accent/10'
              }`}
            >
              😄
            </button>
            <button
              onClick={() => setNewEntry({ ...newEntry, mood: '😐' })}
              className={`rounded-full p-2 text-2xl ${
                newEntry.mood === '😐' ? 'bg-accent/20' : 'hover:bg-accent/10'
              }`}
            >
              😐
            </button>
            <button
              onClick={() => setNewEntry({ ...newEntry, mood: '😫' })}
              className={`rounded-full p-2 text-2xl ${
                newEntry.mood === '😫' ? 'bg-accent/20' : 'hover:bg-accent/10'
              }`}
            >
              😫
            </button>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="text"
              value={newEntry.note}
              onChange={(e) => setNewEntry({ ...newEntry, note: e.target.value })}
              placeholder="How was your workout?"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-foreground"
            />
            <button
              onClick={addJournalEntry}
              className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-border bg-card p-4"
      >
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="font-medium text-foreground">Goals & Achievements</h3>
        </div>

        <div className="mt-4 space-y-4">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between rounded-md border border-border bg-background p-3"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-accent/10 p-2">
                  {goal.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Target className="h-5 w-5 text-accent" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">
                      {goal.description}
                    </h4>
                    {goal.badge && (
                      <span className="text-lg">{goal.badge}</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-accent/20">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{
                          width: `${(goal.current / goal.target) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-foreground-muted">
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
} 