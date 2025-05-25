import { Droplet } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function WaterPanel() {
  const DAILY_GOAL_ML = 2000
  const today = new Date().toISOString().split('T')[0]
  const [intake, setIntake] = useState(0)
  const [amount, setAmount] = useState(250)

  useEffect(() => {
    const saved = localStorage.getItem('waterIntakeMl')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.date === today) {
        setIntake(parsed.amount)
      } else {
        setIntake(0)
        localStorage.setItem('waterIntakeMl', JSON.stringify({ date: today, amount: 0 }))
      }
    }
    const handler = () => {
      const saved = localStorage.getItem('waterIntakeMl')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.date === today) setIntake(parsed.amount)
      }
    }
    window.addEventListener('waterIntakeUpdated', handler)

    // Auto-reset at midnight
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const midnightTimeout = setTimeout(() => {
      setIntake(0);
      localStorage.setItem('waterIntakeMl', JSON.stringify({ date: new Date().toISOString().split('T')[0], amount: 0 }));
      window.dispatchEvent(new Event('waterIntakeUpdated'));
    }, msUntilMidnight);

    return () => {
      window.removeEventListener('waterIntakeUpdated', handler)
      clearTimeout(midnightTimeout)
    }
  }, [today])

  const addDrink = () => {
    const newIntake = Math.min(DAILY_GOAL_ML, intake + amount)
    setIntake(newIntake)
    localStorage.setItem('waterIntakeMl', JSON.stringify({ date: today, amount: newIntake }))
    window.dispatchEvent(new Event('waterIntakeUpdated'))
  }

  return (
    <div className="rounded-xl border border-border bg-card p-2 sm:p-4 shadow-lg flex flex-col gap-3 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Today's Water Intake</h2>
          <p className="text-sm text-foreground-muted">{intake}ml / {DAILY_GOAL_ML}ml</p>
        </div>
        <Droplet className="h-7 w-7 text-blue-500" />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <input
          type="number"
          min={50}
          step={50}
          value={amount}
          onChange={e => setAmount(Math.max(50, parseInt(e.target.value) || 0))}
          className="w-24 rounded-md border border-border bg-background px-2 py-1 text-foreground"
          placeholder="ml per drink"
        />
        <Button onClick={addDrink} variant="outline" size="sm">Add</Button>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-accent/20">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${Math.min(100, (intake / DAILY_GOAL_ML) * 100)}%` }}
        />
      </div>
    </div>
  )
} 