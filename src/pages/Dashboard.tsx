import React from 'react'
import { motion } from 'framer-motion'
import { 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Flame,
  Target,
  Award,
  BarChart2,
  Activity,
  BarChart3,
  Droplet,
  Timer
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import WaterPanel from '../components/WaterPanel'

interface StatCardProps {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  color?: string
}

function StatCard({ title, value, icon: Icon, trend, color = 'primary' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-border bg-card p-2 sm:p-4 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground-muted">{title}</p>
          <p className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">{value}</p>
          {trend && (
            <p className={`mt-1 text-sm ${color === 'primary' ? 'text-primary' : 'text-green-500'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`rounded-lg bg-${color}/10 p-2 sm:p-3`}>
          <Icon className={`h-5 w-5 text-${color} sm:h-6 sm:w-6`} />
        </div>
      </div>
    </motion.div>
  )
}

interface QuickActionProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  to: string
}

function QuickAction({ title, description, icon: Icon, to }: QuickActionProps) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3 rounded-xl border border-border bg-card p-2 sm:p-4 transition-all hover:border-primary/50 hover:shadow-lg sm:gap-4 sm:p-4"
    >
      <div className="rounded-lg bg-primary/10 p-2 text-primary transition-transform group-hover:scale-110 sm:p-3">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
      <div>
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [totalWorkouts, setTotalWorkouts] = useState<number | null>(null)
  const [totalCalories, setTotalCalories] = useState<number | null>(null)
  const [goalProgress, setGoalProgress] = useState<number | null>(null)
  const [achievements, setAchievements] = useState<number | null>(null)

  useEffect(() => {
    const fetchUserAndStats = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (!data.user) return
      // Fetch total workouts
      supabase
        .from('workout_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', data.user.id)
        .then(({ count }) => setTotalWorkouts(count ?? 0))
      // Fetch total calories
      supabase
        .from('nutrition_logs')
        .select('calories')
        .eq('user_id', data.user.id)
        .then(({ data }) => setTotalCalories(data?.reduce((sum, row) => sum + (row.calories || 0), 0) ?? 0))
      // Fetch goal progress (average percent of completed goals)
      supabase
        .from('goals')
        .select('completed')
        .eq('user_id', data.user.id)
        .then(({ data }) => {
          if (!data || data.length === 0) setGoalProgress(0)
          else setGoalProgress(Math.round((data.filter(g => g.completed).length / data.length) * 100))
          setAchievements(data?.filter(g => g.completed).length ?? 0)
        })
    }
    fetchUserAndStats()
  }, [])

  const statsData = [
    {
      icon: Dumbbell,
      title: 'Total Workouts',
      value: '42',
      color: 'bg-blue-50 text-blue-600',
      trend: '+12%'
    },
    {
      icon: Flame,
      title: 'Calories Burned',
      value: '3,456',
      color: 'bg-orange-50 text-orange-600',
      trend: '+8%'
    },
    {
      icon: Target,
      title: 'Goal Progress',
      value: '65%',
      color: 'bg-green-50 text-green-600',
      trend: '+5%'
    },
    {
      icon: Award,
      title: 'Achievements',
      value: '7',
      color: 'bg-purple-50 text-purple-600',
      trend: '+3'
    }
  ]

  const workoutHistory = [
    {
      name: 'Strength Training',
      date: 'Feb 15, 2024',
      duration: '1h 15m',
      intensity: 'High',
      calories: 450,
      icon: BarChart2
    },
    {
      name: 'HIIT Cardio',
      date: 'Feb 13, 2024',
      duration: '45m',
      intensity: 'Medium',
      calories: 350,
      icon: Flame
    },
    {
      name: 'Yoga Flow',
      date: 'Feb 10, 2024',
      duration: '1h',
      intensity: 'Low',
      calories: 200,
      icon: Target
    }
  ]

  const upcomingWorkouts = [
    {
      name: 'Leg Day',
      date: 'Tomorrow',
      exercises: [
        { name: 'Squats', sets: 4, reps: 12 },
        { name: 'Lunges', sets: 3, reps: 15 },
        { name: 'Leg Press', sets: 3, reps: 10 }
      ]
    }
  ]

  return (
    <div className="space-y-4 px-2 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Dashboard</h1>
        <p className="mt-1 text-sm text-foreground-muted sm:text-base">Welcome back! Here's your fitness overview.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Workouts"
          value={totalWorkouts === null ? '...' : totalWorkouts.toString()}
          icon={Activity}
        />
        <StatCard
          title="Calories Burned"
          value={totalCalories === null ? '...' : totalCalories.toString()}
          icon={Flame}
        />
        <StatCard
          title="Goal Progress"
          value={goalProgress === null ? '...' : `${goalProgress}%`}
          icon={Target}
        />
        <StatCard
          title="Achievements"
          value={achievements === null ? '...' : achievements.toString()}
          icon={Award}
        />
      </div>

      {/* Water Panel */}
      <WaterPanel />

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground sm:mb-4 sm:text-lg">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <QuickAction
            title="Start Workout"
            description="Begin your next training session"
            icon={Activity}
            to="/workout-tracker"
          />
          <QuickAction
            title="View Exercise Library"
            description="Browse and manage your exercises"
            icon={Dumbbell}
            to="/exercises"
          />
          <QuickAction
            title="Track Nutrition"
            description="Log your meals and water intake"
            icon={Droplet}
            to="/nutrition"
          />
          <QuickAction
            title="Create Superset"
            description="Set up a new superset workout"
            icon={Timer}
            to="/supersets"
          />
          <QuickAction
            title="View Progress"
            description="Check your fitness journey"
            icon={TrendingUp}
            to="/progress"
          />
          <QuickAction
            title="Set Goals"
            description="Update your fitness goals"
            icon={Target}
            to="/goals"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground sm:mb-4 sm:text-lg">Recent Activity</h2>
        <div className="space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-2 sm:p-4"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Upper Body Workout</h3>
                <p className="text-sm text-foreground-muted">Completed 2 hours ago</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-2 sm:p-4"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-lg bg-green-500/10 p-2">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Goal Achieved: 5K Run</h3>
                <p className="text-sm text-foreground-muted">Completed yesterday</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-2 sm:p-4"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Droplet className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Water Intake Goal</h3>
                <p className="text-sm text-foreground-muted">Achieved 2 days ago</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
