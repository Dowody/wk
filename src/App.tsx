import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Home,
  Activity,
  Calendar,
  Settings as SettingsIcon,
  BarChart3,
  ChevronRight,
  Dumbbell,
  Timer,
  Target,
  Droplet,
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import WorkoutPlan from './pages/WorkoutPlan'
import WorkoutTracker from './pages/WorkoutTracker'
import Progress from './pages/progress'
import Settings from './pages/settings'
import JournalAndGoals from './components/JournalAndGoals'
import SupersetMode from './components/SupersetMode'
import NutritionTracker from './components/NutritionTracker'
import ExerciseManager from './components/ExerciseManager'
import { JournalEntry, WorkoutGoal, NutritionLog } from './data/workoutFeatures'
import { supabase } from './lib/supabaseClient'
import { Toaster } from './components/ui/toaster'

interface NavItem {
  path: string
  name: string
  icon: React.ComponentType<{ className?: string }>
}

const mainNavItems: NavItem[] = [
  { path: '/', name: 'Dashboard', icon: Home },
  { path: '/workout-plan', name: 'Workout Plan', icon: Calendar },
  { path: '/workout-tracker', name: 'Workout Tracker', icon: Activity },
  { path: '/progress', name: 'Progress', icon: BarChart3 },
]

const toolsNavItems: NavItem[] = [
  { path: '/exercises', name: 'Exercise Library', icon: Dumbbell },
  { path: '/supersets', name: 'Supersets', icon: Timer },
  { path: '/nutrition', name: 'Nutrition', icon: Droplet },
  { path: '/goals', name: 'Goals & Journal', icon: Target },
]

interface NavLinkProps {
  to: string
  children: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  isMobile?: boolean
  onClick?: () => void
}

function NavLink({ to, children, icon: Icon, isMobile = false, onClick }: NavLinkProps) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl p-3 transition-all duration-200
        ${isActive 
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
          : 'text-foreground-muted hover:bg-accent/50 hover:text-foreground'}`}
    >
      <div className={`rounded-lg p-2 transition-all duration-200
        ${isActive ? 'bg-primary-foreground/20' : 'bg-accent/50'}`}>
        <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
      </div>
      <span className="font-medium">{children}</span>
      {!isMobile && (
        <ChevronRight className={`ml-auto h-4 w-4 transition-transform duration-200 ${isActive ? 'translate-x-1' : 'opacity-0'}`} />
      )}
    </Link>
  )
}

function AuthForm({ onAuth }: { onAuth: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else onAuth()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form className="w-full max-w-xs space-y-6" onSubmit={handleSignIn}>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
          <p className="text-sm text-foreground-muted mt-1">Enter your credentials to continue</p>
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="input h-11 rounded-lg text-base px-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="input h-11 rounded-lg text-base px-3"
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button type="submit" className="btn btn-primary w-full h-11 rounded-lg text-base">Sign In</button>
      </form>
    </div>
  )
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [goals, setGoals] = useState<WorkoutGoal[]>([])
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([])
  const location = useLocation()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      setIsDarkMode(savedDarkMode === 'true')
      document.documentElement.classList.toggle('dark', savedDarkMode === 'true')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString())
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }
    getUser()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => { listener.subscription.unsubscribe() }
  }, [])

  const handleAddJournalEntry = (entry: JournalEntry) => {
    setJournalEntries([...journalEntries, entry])
  }

  const handleUpdateGoal = (goal: WorkoutGoal) => {
    setGoals(goals.map((g) => (g.id === goal.id ? goal : g)))
  }

  const handleAddNutritionLog = (log: NutritionLog) => {
    setNutritionLogs([...nutritionLogs, log])
  }

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user) return <AuthForm onAuth={() => window.location.reload()} />

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-background text-foreground">
        <Toaster />
        {/* Desktop Sidebar */}
        <motion.nav
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed hidden h-screen w-80 border-r border-border bg-card p-6 lg:block"
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 px-2 py-4">
              <div className="rounded-xl bg-primary p-2">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">Workout Tracker</span>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <h3 className="mb-2 px-4 text-sm font-medium text-foreground-muted">Main</h3>
                <div className="space-y-1">
                  {mainNavItems.map((item) => (
                    <NavLink 
                      key={item.path} 
                      to={item.path} 
                      icon={item.icon}
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 px-4 text-sm font-medium text-foreground-muted">Tools</h3>
                <div className="space-y-1">
                  {toolsNavItems.map((item) => (
                    <NavLink 
                      key={item.path} 
                      to={item.path} 
                      icon={item.icon}
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <Link
                to="/settings"
                className="flex items-center gap-3 rounded-xl p-4 text-foreground-muted transition-colors hover:bg-accent/50 hover:text-foreground"
              >
                <div className="rounded-lg bg-accent/50 p-2">
                  <SettingsIcon className="h-5 w-5" />
                </div>
                <span className="font-medium">Settings</span>
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* Mobile Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 z-40 w-full border-b border-border bg-card lg:hidden"
        >
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary p-2">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">Workout Tracker</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-xl p-2 text-foreground-muted hover:bg-accent/50"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </motion.header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 z-30 w-full border-b border-border bg-card p-4 lg:hidden"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 px-4 text-sm font-medium text-foreground-muted">Main</h3>
                  <div className="space-y-1">
                    {mainNavItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        icon={item.icon}
                        isMobile
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 px-4 text-sm font-medium text-foreground-muted">Tools</h3>
                  <div className="space-y-1">
                    {toolsNavItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        icon={item.icon}
                        isMobile
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="min-h-screen w-full bg-background pt-16 lg:pl-80">
          <div className="container mx-auto max-w-5xl p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="py-4"
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/workout-plan" element={<WorkoutPlan />} />
                  <Route path="/workout-tracker" element={<WorkoutTracker />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/exercises" element={<ExerciseManager />} />
                  <Route path="/supersets" element={<SupersetMode onComplete={() => {}} />} />
                  <Route path="/nutrition" element={<NutritionTracker onAddLog={handleAddNutritionLog} />} />
                  <Route path="/goals" element={
                    <JournalAndGoals
                      workoutLogs={[]}
                      onAddJournalEntry={handleAddJournalEntry}
                      onUpdateGoal={handleUpdateGoal}
                    />
                  } />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
