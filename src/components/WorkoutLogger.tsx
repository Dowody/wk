import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

type LogEntry = {
  exerciseId: string
  sets: number
  reps: number
  weight: number
  notes: string
}

export function WorkoutLogger() {
  const [logs, setLogs] = useState<Record<string, LogEntry>>(() => {
    const saved = localStorage.getItem('workoutLogs')
    return saved ? JSON.parse(saved) : {}
  })

  useEffect(() => {
    localStorage.setItem('workoutLogs', JSON.stringify(logs))
  }, [logs])

  const updateLog = (exerciseId: string, field: keyof LogEntry, value: string | number) => {
    setLogs(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value
      }
    }))
  }

  const deleteLog = (exerciseId: string) => {
    setLogs(prev => {
      const newLogs = { ...prev }
      delete newLogs[exerciseId]
      return newLogs
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Workout Log</h2>
        <p className="text-muted-foreground mt-2">Track your sets, reps, and weights for each exercise</p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(logs).map(([exerciseId, log]) => (
            <div key={exerciseId} className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{exerciseId}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteLog(exerciseId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sets</label>
                  <Input
                    type="number"
                    placeholder="Sets"
                    value={log.sets}
                    onChange={(e) => updateLog(exerciseId, 'sets', parseInt(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reps</label>
                  <Input
                    type="number"
                    placeholder="Reps"
                    value={log.reps}
                    onChange={(e) => updateLog(exerciseId, 'reps', parseInt(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weight (kg)</label>
                  <Input
                    type="number"
                    placeholder="Weight"
                    value={log.weight}
                    onChange={(e) => updateLog(exerciseId, 'weight', parseInt(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    placeholder="Add notes..."
                    value={log.notes}
                    onChange={(e) => updateLog(exerciseId, 'notes', e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          ))}
          {Object.keys(logs).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">No Workouts Logged</h3>
              <p className="text-sm text-muted-foreground">Start tracking your progress by logging your first workout</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
