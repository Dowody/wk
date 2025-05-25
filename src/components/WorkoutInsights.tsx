import { motion } from 'framer-motion'
import { WorkoutLog, getWorkoutRecommendations, calculateProgress } from '../data/workoutHistory'
import { WorkoutDay } from '../data/workoutPlan'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface WorkoutInsightsProps {
  workoutLogs: WorkoutLog[]
  workoutPlan: WorkoutDay[]
}

export default function WorkoutInsights({
  workoutLogs,
  workoutPlan,
}: WorkoutInsightsProps) {
  const recommendations = getWorkoutRecommendations(workoutLogs)
  const progress = calculateProgress(workoutLogs)

  // Prepare data for weight progression chart
  const weightData = workoutLogs
    .flatMap(log =>
      log.exercises.flatMap(ex =>
        ex.sets.map(set => ({
          date: log.date,
          weight: set.weight,
          exercise: ex.name,
        }))
      )
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-6">
      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card p-4"
      >
        <h3 className="font-medium text-foreground">Smart Recommendations</h3>
        <div className="mt-4 space-y-2">
          {recommendations.map((rec, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-sm text-foreground-muted"
            >
              {rec}
            </motion.p>
          ))}
        </div>
      </motion.div>

      {/* Progress Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium text-foreground">Workout Stats</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-foreground-muted">Total Workouts</p>
              <p className="text-2xl font-bold text-foreground">
                {progress.totalWorkouts}
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Total Sets</p>
              <p className="text-2xl font-bold text-foreground">
                {progress.totalSets}
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Total Reps</p>
              <p className="text-2xl font-bold text-foreground">
                {progress.totalReps}
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Max Weight</p>
              <p className="text-2xl font-bold text-foreground">
                {progress.maxWeight}kg
              </p>
            </div>
          </div>
        </div>

        {/* Weight Progression Chart */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium text-foreground">Weight Progression</h3>
          <div className="mt-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) =>
                    new Date(date).toLocaleDateString()
                  }
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 