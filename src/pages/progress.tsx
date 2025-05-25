import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Calendar, Dumbbell, Plus, Trash2 } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { WorkoutLog, BodyMeasurement } from '../data/workoutHistory'
import { workoutPlan } from '../data/workoutPlan'
import { supabase } from '../lib/supabaseClient'

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastWorkoutDate: string | null
}

export default function Progress() {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([])
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [newMeasurement, setNewMeasurement] = useState<BodyMeasurement>({
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    waist: undefined,
    chest: undefined,
    arms: undefined,
    body_fat: undefined,
  })
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
  })

  // Fetch workout logs from Supabase
  useEffect(() => {
    const fetchLogs = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
      if (error) {
        console.error('Error fetching workout logs:', error)
        return
      }
      const logs = (data || []).map(log => ({
        date: log.date,
        day: new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' }),
        focus: log.type,
        exercises: log.exercises,
        mood: log.mood,
        notes: log.notes,
      }))
      setWorkoutLogs(logs)
      calculateStreak(logs)
    }
    fetchLogs()
  }, [])

  // Fetch measurements from Supabase
  useEffect(() => {
    const fetchMeasurements = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
      if (error) {
        console.error('Error fetching measurements:', error)
        return
      }
      setMeasurements(data || [])
    }
    fetchMeasurements()
  }, [])

  const calculateStreak = (workoutLogs: WorkoutLog[]) => {
    if (!workoutLogs.length) return

    const sortedLogs = [...workoutLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    let currentStreak = 1
    let longestStreak = 1
    let lastWorkoutDate = new Date(sortedLogs[sortedLogs.length - 1].date)

    for (let i = sortedLogs.length - 1; i > 0; i--) {
      const currentDate = new Date(sortedLogs[i].date)
      const previousDate = new Date(sortedLogs[i - 1].date)
      const dayDifference = Math.floor(
        (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (dayDifference === 1) {
        currentStreak++
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        currentStreak = 1
      }
    }

    setStreakData({
      currentStreak,
      longestStreak,
      lastWorkoutDate: lastWorkoutDate.toISOString(),
    })
  }

  const getChartData = () => {
    const last30Days = workoutLogs
      .filter((log) => {
        const logDate = new Date(log.date)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return logDate >= thirtyDaysAgo
      })
      .map((log) => ({
        date: new Date(log.date).toLocaleDateString(),
        exercises: log.exercises.length,
        totalSets: log.exercises.reduce(
          (sum, exercise) => sum + exercise.sets.length,
          0
        ),
      }))

    return last30Days
  }

  const addMeasurement = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const measurement = { ...newMeasurement, user_id: user.id }
    const { error } = await supabase.from('body_measurements').insert([measurement])
    if (error) {
      console.error('Error saving measurement:', error)
      return
    }
    setMeasurements([...measurements, measurement])
    setNewMeasurement({
      date: new Date().toISOString().split('T')[0],
      weight: 0,
      waist: undefined,
      chest: undefined,
      arms: undefined,
      body_fat: undefined,
    })
  }

  const removeMeasurement = async (index: number) => {
    const measurement = measurements[index]
    if (!measurement || !measurement.id) return
    const { error } = await supabase.from('body_measurements').delete().eq('id', measurement.id)
    if (error) {
      console.error('Error deleting measurement:', error)
      return
    }
    setMeasurements(measurements.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Progress</h1>
        <p className="mt-1 text-sm text-foreground-muted sm:text-base">Track your fitness journey</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">Total Workouts</p>
              <p className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">{workoutLogs.length}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-2 sm:p-3">
              <Flame className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">This Week</p>
              <p className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">
                {workoutLogs.filter(log => {
                  const logDate = new Date(log.date)
                  const today = new Date()
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                  return logDate >= weekAgo && logDate <= today
                }).length}
              </p>
            </div>
            <div className="rounded-lg bg-green-500/10 p-2 sm:p-3">
              <Calendar className="h-5 w-5 text-green-500 sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">Most Common</p>
              <p className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">
                {workoutLogs.length > 0 ? workoutLogs[0].focus : 'No workouts yet'}
              </p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-2 sm:p-3">
              <Trophy className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">Completion Rate</p>
              <p className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">
                {workoutLogs.length > 0 ? ((workoutLogs.filter(log => log.exercises.length > 0).length / workoutLogs.length) * 100).toFixed(2) : 'No workouts yet'}%
              </p>
            </div>
            <div className="rounded-lg bg-purple-500/10 p-2 sm:p-3">
              <Flame className="h-5 w-5 text-purple-500 sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Streak Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h3 className="font-medium text-foreground">Current Streak</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {streakData.currentStreak} days
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="font-medium text-foreground">Longest Streak</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {streakData.longestStreak} days
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium text-foreground">Last Workout</h3>
          </div>
          <p className="mt-2 text-foreground">
            {streakData.lastWorkoutDate
              ? new Date(streakData.lastWorkoutDate).toLocaleDateString()
              : 'No workouts yet'}
          </p>
        </motion.div>
      </div>

      {/* Workout Activity Chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-foreground">30-Day Activity</h3>
        </div>
        <div className="mt-4 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="exercises"
                stroke="#8884d8"
                name="Exercises"
              />
              <Line
                type="monotone"
                dataKey="totalSets"
                stroke="#82ca9d"
                name="Total Sets"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-medium text-foreground">Recent Workouts</h3>
        <div className="mt-4 space-y-4">
          {workoutLogs.slice(-5).reverse().map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-md border border-border bg-background p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">
                    {log.day} - {log.focus}
                  </h4>
                  <p className="text-sm text-foreground-muted">
                    {new Date(log.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm text-foreground-muted">
                  {log.exercises.length} exercises
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Body Measurements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card p-4"
      >
        <h3 className="font-medium text-foreground">Body Measurements</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Track your physical progress over time
        </p>

        <div className="mt-4 space-y-4">
          {/* Measurement History */}
          {measurements.map((measurement, index) => (
            <motion.div
              key={measurement.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-md border border-border bg-background p-3"
            >
              <div>
                <p className="font-medium text-foreground">
                  {new Date(measurement.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-foreground-muted">
                  Weight: {measurement.weight}kg
                  {measurement.waist && ` • Waist: ${measurement.waist}cm`}
                  {measurement.chest && ` • Chest: ${measurement.chest}cm`}
                  {measurement.arms && ` • Arms: ${measurement.arms}cm`}
                  {measurement.body_fat && ` • Body Fat: ${measurement.body_fat}%`}
                </p>
              </div>
              <button
                onClick={() => removeMeasurement(index)}
                className="rounded-full p-1 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}

          {/* Add New Measurement */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 rounded-md border border-border bg-background p-3">
            <input
              type="date"
              value={newMeasurement.date}
              onChange={(e) =>
                setNewMeasurement({ ...newMeasurement, date: e.target.value })
              }
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground w-full sm:w-auto"
            />
            <input
              type="number"
              value={newMeasurement.weight || ''}
              onChange={(e) =>
                setNewMeasurement({
                  ...newMeasurement,
                  weight: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Weight (kg)"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground w-full sm:w-32"
            />
            <input
              type="number"
              value={newMeasurement.waist || ''}
              onChange={(e) =>
                setNewMeasurement({
                  ...newMeasurement,
                  waist: parseFloat(e.target.value) || undefined,
                })
              }
              placeholder="Waist (cm)"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground w-full sm:w-32"
            />
            <input
              type="number"
              value={newMeasurement.chest || ''}
              onChange={(e) =>
                setNewMeasurement({
                  ...newMeasurement,
                  chest: parseFloat(e.target.value) || undefined,
                })
              }
              placeholder="Chest (cm)"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground w-full sm:w-32"
            />
            <input
              type="number"
              value={newMeasurement.arms || ''}
              onChange={(e) =>
                setNewMeasurement({
                  ...newMeasurement,
                  arms: parseFloat(e.target.value) || undefined,
                })
              }
              placeholder="Arms (cm)"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground w-full sm:w-32"
            />
            <input
              type="number"
              value={newMeasurement.body_fat || ''}
              onChange={(e) =>
                setNewMeasurement({
                  ...newMeasurement,
                  body_fat: parseFloat(e.target.value) || undefined,
                })
              }
              placeholder="Body Fat (%)"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground w-full sm:w-32"
            />
            <button
              onClick={addMeasurement}
              className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
