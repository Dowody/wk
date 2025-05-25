import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Droplet, Apple, Trash2 } from 'lucide-react'
import { NutritionLog } from '../data/workoutFeatures'
import WaterPanel from './WaterPanel'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface NutritionTrackerProps {
  onAddLog: (log: NutritionLog) => void
}

export default function NutritionTracker({ onAddLog }: NutritionTrackerProps) {
  const [logs, setLogs] = useState<NutritionLog[]>([])
  const [newLog, setNewLog] = useState<Partial<NutritionLog>>({
    date: new Date().toISOString().split('T')[0],
  })

  const addLog = () => {
    const log: NutritionLog = {
      date: newLog.date || new Date().toISOString().split('T')[0],
      water: newLog.water ?? 0,
      calories: newLog.calories,
      protein: newLog.protein,
      carbs: newLog.carbs,
      fat: newLog.fat,
      notes: newLog.notes,
    }
    setLogs([...logs, log])
    onAddLog(log)
    setNewLog({
      date: new Date().toISOString().split('T')[0],
    })
  }

  const removeLog = (index: number) => {
    setLogs(logs.filter((_, i) => i !== index))
  }

  // Water intake chart data for last 14 days
  const DAILY_GOAL_ML = 2000
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return d
  })
  const waterData = days.map(date => {
    const key = date.toISOString().split('T')[0]
    const saved = localStorage.getItem('waterIntakeMl')
    let amount = 0
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.date === key) amount = parsed.amount
    }
    return {
      date: key.slice(5),
      amount,
      goalMet: amount >= DAILY_GOAL_ML,
    }
  })

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <h3 className="font-medium text-foreground mb-2">Water Intake (Last 14 Days)</h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={waterData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis hide domain={[0, DAILY_GOAL_ML]} />
            <Tooltip formatter={v => `${v}ml`} />
            <Bar dataKey="amount">
              {waterData.map((entry, idx) => (
                <Cell key={idx} fill={entry.goalMet ? '#3b82f6' : '#cbd5e1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <WaterPanel />
      {/* Nutrition Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-border bg-card p-4"
      >
        <div className="flex items-center gap-2">
          <Apple className="h-5 w-5 text-green-500" />
          <h3 className="font-medium text-foreground">Nutrition Log</h3>
        </div>
        <p className="mt-2 text-sm text-foreground-muted">Water intake is tracked separately on the Dashboard.</p>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="number"
              value={newLog.calories || ''}
              onChange={(e) =>
                setNewLog({
                  ...newLog,
                  calories: parseFloat(e.target.value) || undefined,
                })
              }
              placeholder="Calories"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
            />
            <input
              type="number"
              value={newLog.protein || ''}
              onChange={(e) =>
                setNewLog({
                  ...newLog,
                  protein: parseFloat(e.target.value) || undefined,
                })
              }
              placeholder="Protein (g)"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
            />
            <input
              type="number"
              value={newLog.carbs || ''}
              onChange={(e) =>
                setNewLog({
                  ...newLog,
                  carbs: parseFloat(e.target.value) || undefined,
                })
              }
              placeholder="Carbs (g)"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
            />
            <input
              type="number"
              value={newLog.fat || ''}
              onChange={(e) =>
                setNewLog({
                  ...newLog,
                  fat: parseFloat(e.target.value) || undefined,
                })
              }
              placeholder="Fat (g)"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
            />
          </div>

          <div className="flex items-center gap-4">
            <input
              type="text"
              value={newLog.notes || ''}
              onChange={(e) =>
                setNewLog({ ...newLog, notes: e.target.value })
              }
              placeholder="Notes (optional)"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-foreground"
            />
            <button
              onClick={addLog}
              className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="mt-4 space-y-4">
          {logs.slice(-5).reverse().map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between rounded-md border border-border bg-background p-3"
            >
              <div>
                <p className="font-medium text-foreground">
                  {new Date(log.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-foreground-muted">
                  Calories: {log.calories || 0}, Protein: {log.protein || 0}g, Carbs: {log.carbs || 0}g, Fat: {log.fat || 0}g
                </p>
                {log.notes && <p className="text-xs text-foreground-muted">{log.notes}</p>}
              </div>
              <button
                onClick={() => removeLog(index)}
                className="rounded-full p-1 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
} 