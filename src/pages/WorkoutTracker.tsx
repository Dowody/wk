import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Plus, X, Check, Save, Dumbbell, Target } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { workoutPlan } from '../data/workoutPlan'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../components/ui/use-toast'

const WORKOUT_TYPES = [
  { label: 'Push', value: 'Push' },
  { label: 'Pull', value: 'Pull' },
  { label: 'Legs', value: 'Legs' },
  { label: 'Custom', value: 'Custom' },
]

interface Set {
  reps: number
  weight: number
  completed: boolean
}

interface Exercise {
  name: string
  sets: Set[]
  notes: string
  completed: boolean
  extraSets: Set[]
}

export default function WorkoutTracker() {
  const { toast } = useToast()
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [type, setType] = useState('Push')
  const [mood, setMood] = useState<'😄' | '😐' | '😫' | undefined>(undefined)
  const [exercises, setExercises] = useState<Exercise[]>([
    { 
      name: '', 
      sets: [{ reps: 0, weight: 0, completed: false }], 
      notes: '', 
      completed: false,
      extraSets: [] 
    }
  ])
  const [saving, setSaving] = useState(false)
  const [workoutCompleted, setWorkoutCompleted] = useState(false)
  const [setTimers, setSetTimers] = useState<{ [key: string]: number }>({})
  const [setTimerActive, setSetTimerActive] = useState<{ [key: string]: boolean }>({})
  const timerRefs = useRef<{ [key: string]: NodeJS.Timeout | null }>({})

  // Helper to get weekday name from date
  function getWeekday(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' })
  }

  // Suggest plan for selected day
  function suggestPlan(dateStr: string, typeOverride?: string) {
    const weekday = getWeekday(dateStr)
    let plan = workoutPlan.find(d => d.day === weekday)
    if (typeOverride) {
      plan = workoutPlan.find(d => d.focus === typeOverride)
    }
    if (plan && plan.exercises.length > 0) {
      setExercises(plan.exercises.map(ex => ({
        name: ex.name,
        sets: Array.from({ length: ex.sets }, () => ({ reps: ex.reps, weight: ex.weight || 0, completed: false })),
        notes: ex.notes || '',
        completed: false,
        extraSets: []
      })))
    } else {
      setExercises([{ name: '', sets: [{ reps: 0, weight: 0, completed: false }], notes: '', completed: false, extraSets: [] }])
    }
  }

  // Auto-suggest on date/type change
  useEffect(() => {
    suggestPlan(date, type)
  }, [date, type])

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ reps: 0, weight: 0, completed: false }], notes: '', completed: false, extraSets: [] }])
  }
  const handleRemoveExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx))
  }
  const handleAddSet = (exIdx: number) => {
    const newExercises = [...exercises]
    newExercises[exIdx].sets.push({ reps: 0, weight: 0, completed: false })
    setExercises(newExercises)
  }
  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    const newExercises = [...exercises]
    newExercises[exIdx].sets.splice(setIdx, 1)
    setExercises(newExercises)
  }
  const handleSetChange = (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: number) => {
    const newExercises = [...exercises]
    newExercises[exIdx].sets[setIdx][field] = value
    setExercises(newExercises)
  }
  const handleExerciseName = (exIdx: number, value: string) => {
    const newExercises = [...exercises]
    newExercises[exIdx].name = value
    setExercises(newExercises)
  }
  const handleExerciseNotes = (exIdx: number, value: string) => {
    const newExercises = [...exercises]
    newExercises[exIdx].notes = value
    setExercises(newExercises)
  }
  const handleSetCompleted = (exIdx: number, setIdx: number, value: boolean) => {
    const newExercises = [...exercises]
    newExercises[exIdx].sets[setIdx].completed = value
    setExercises(newExercises)
  }

  const handleExerciseComplete = (exIdx: number) => {
    const newExercises = [...exercises]
    newExercises[exIdx].completed = true
    setExercises(newExercises)
  }

  const handleWorkoutComplete = async () => {
    try {
      setWorkoutCompleted(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('workout_logs')
        .upsert([{
          user_id: user.id,
          date,
          type,
          mood,
          completed: true,
          exercises: exercises.map(ex => ({
            name: ex.name,
            sets: ex.sets.map(set => ({
              reps: set.reps,
              weight: set.weight,
              completed: set.completed
            })),
            extra_sets: ex.extraSets.map(set => ({
              reps: set.reps,
              weight: set.weight,
              completed: set.completed
            })),
            notes: ex.notes,
            completed: ex.completed
          }))
        }], {
          onConflict: 'user_id,date'
        })

      if (error) throw error

      toast({
        title: "Workout completed",
        description: "Great job! Your workout has been marked as complete.",
      })
    } catch (error) {
      console.error('Error completing workout:', error)
      toast({
        title: "Error completing workout",
        description: "There was a problem marking your workout as complete. Please try again.",
        variant: "destructive"
      })
      setWorkoutCompleted(false)
    }
  }

  const handleAddExtraSet = (exIdx: number) => {
    const newExercises = [...exercises]
    newExercises[exIdx].extraSets.push({ reps: 0, weight: 0, completed: false })
    setExercises(newExercises)
  }

  const handleRemoveExtraSet = (exIdx: number, setIdx: number) => {
    const newExercises = [...exercises]
    newExercises[exIdx].extraSets.splice(setIdx, 1)
    setExercises(newExercises)
  }

  const handleExtraSetChange = (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: number) => {
    const newExercises = [...exercises]
    newExercises[exIdx].extraSets[setIdx][field] = value
    setExercises(newExercises)
  }

  const handleExtraSetCompleted = (exIdx: number, setIdx: number, value: boolean) => {
    const newExercises = [...exercises]
    newExercises[exIdx].extraSets[setIdx].completed = value
    setExercises(newExercises)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const workoutData = {
        user_id: user.id,
        date,
        type,
        mood,
        completed: workoutCompleted,
        exercises: exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets.map(set => ({
            reps: set.reps,
            weight: set.weight,
            completed: set.completed
          })),
          extra_sets: ex.extraSets.map(set => ({
            reps: set.reps,
            weight: set.weight,
            completed: set.completed
          })),
          notes: ex.notes,
          completed: ex.completed
        }))
      }

      const { error } = await supabase
        .from('workout_logs')
        .upsert([workoutData], {
          onConflict: 'user_id,date'
        })

      if (error) throw error

      toast({
        title: "Workout saved",
        description: "Your workout has been saved successfully.",
      })
    } catch (error) {
      console.error('Error saving workout:', error)
      toast({
        title: "Error saving workout",
        description: "There was a problem saving your workout. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Load existing workout if available
  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', date)
          .maybeSingle()

        if (error) throw error
        if (!data) return

        setType(data.type)
        setMood(data.mood)
        setWorkoutCompleted(data.completed)
        setExercises(data.exercises.map((ex: any) => ({
          name: ex.name,
          sets: ex.sets.map((set: any) => ({
            reps: set.reps,
            weight: set.weight,
            completed: set.completed
          })),
          extraSets: ex.extra_sets.map((set: any) => ({
            reps: set.reps,
            weight: set.weight,
            completed: set.completed
          })),
          notes: ex.notes,
          completed: ex.completed
        })))
      } catch (error) {
        console.error('Error loading workout:', error)
      }
    }

    loadWorkout()
  }, [date])

  // Calculate workout progress
  const workoutProgress = {
    totalExercises: exercises.length,
    completedExercises: exercises.filter(e => e.completed).length,
    totalSets: exercises.reduce((sum, ex) => sum + ex.sets.length + ex.extraSets.length, 0),
    completedSets: exercises.reduce((sum, ex) => 
      sum + ex.sets.filter(s => s.completed).length + ex.extraSets.filter(s => s.completed).length, 0
    ),
  }

  // Helper to get a unique key for each set
  const getSetKey = (exIdx: number, setIdx: number, isExtra: boolean = false) => `${exIdx}-${isExtra ? 'extra' : 'main'}-${setIdx}`

  // Timer handlers
  const startSetTimer = (exIdx: number, setIdx: number, isExtra: boolean = false) => {
    const key = getSetKey(exIdx, setIdx, isExtra)
    if (setTimerActive[key]) return
    setSetTimerActive(prev => ({ ...prev, [key]: true }))
    timerRefs.current[key] = setInterval(() => {
      setSetTimers(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }))
    }, 1000)
  }
  const stopSetTimer = (exIdx: number, setIdx: number, isExtra: boolean = false) => {
    const key = getSetKey(exIdx, setIdx, isExtra)
    setSetTimerActive(prev => ({ ...prev, [key]: false }))
    if (timerRefs.current[key]) {
      clearInterval(timerRefs.current[key]!)
      timerRefs.current[key] = null
    }
  }
  const resetSetTimer = (exIdx: number, setIdx: number, isExtra: boolean = false) => {
    const key = getSetKey(exIdx, setIdx, isExtra)
    setSetTimers(prev => ({ ...prev, [key]: 0 }))
    stopSetTimer(exIdx, setIdx, isExtra)
  }
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach(timer => timer && clearInterval(timer))
    }
  }, [])

  // Helper to format seconds as mm:ss
  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl space-y-6 px-1 sm:px-3 py-4 sm:py-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Workout Tracker</h1>
            <p className="text-xs sm:text-sm text-foreground-muted">Log your workout for today</p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Calendar className="h-5 w-5 text-foreground-muted" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-foreground text-xs sm:text-base"
            />
          </div>
        </div>

        {/* Workout Type Selector */}
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          {WORKOUT_TYPES.map(t => (
            <Button
              key={t.value}
              variant={type === t.value ? 'default' : 'outline'}
              size="sm"
              className="text-xs sm:text-sm px-2 sm:px-3 py-1"
              onClick={() => setType(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>

        {/* Workout Progress */}
        <div className="rounded-xl border border-border bg-card p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1 sm:gap-0">
            <h3 className="text-base sm:text-lg font-semibold">Workout Progress</h3>
            <div className="text-xs sm:text-sm text-foreground-muted">
              {workoutProgress.completedExercises}/{workoutProgress.totalExercises} Exercises
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(workoutProgress.completedExercises / workoutProgress.totalExercises) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-xs sm:text-sm text-foreground-muted">
            {workoutProgress.completedSets}/{workoutProgress.totalSets} Sets Completed
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-3 sm:space-y-4">
          {exercises.map((ex, exIdx) => {
            const allSetsDone = ex.sets.length > 0 && ex.sets.every(s => s.completed)
            const allExtraSetsDone = ex.extraSets.length > 0 && ex.extraSets.every(s => s.completed)
            const isExerciseComplete = ex.completed || (allSetsDone && allExtraSetsDone)
            const completedSets = ex.sets.filter(s => s.completed).length + ex.extraSets.filter(s => s.completed).length
            const totalSets = ex.sets.length + ex.extraSets.length
            
            return (
              <motion.div
                key={exIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border border-border bg-card p-2 sm:p-4 shadow-sm transition-all duration-300 ${
                  isExerciseComplete ? 'ring-2 ring-green-400 bg-green-50/10' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    <Input
                      placeholder="Exercise name"
                      value={ex.name}
                      onChange={e => handleExerciseName(exIdx, e.target.value)}
                      className="flex-1 text-xs sm:text-base"
                    />
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <div className="text-xs sm:text-sm text-foreground-muted">
                      {completedSets}/{totalSets} Sets
                    </div>
                    {isExerciseComplete && <Check className="h-5 w-5 text-green-500" />}
                    <Button 
                      variant={isExerciseComplete ? "default" : "outline"}
                      size="sm"
                      className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-1"
                      onClick={() => handleExerciseComplete(exIdx)}
                    >
                      {isExerciseComplete ? 'Completed' : 'Complete Exercise'}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveExercise(exIdx)}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Sets Container */}
                <div className="space-y-2 sm:space-y-4">
                  {/* Planned Sets */}
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-medium text-foreground-muted">Planned Sets</h4>
                      <div className="text-xs text-foreground-muted">
                        {ex.sets.filter(s => s.completed).length}/{ex.sets.length} Completed
                      </div>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      {ex.sets.map((set, setIdx) => (
                        <div key={setIdx} className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <input
                            type="checkbox"
                            checked={!!set.completed}
                            onChange={e => handleSetCompleted(exIdx, setIdx, e.target.checked)}
                            className="accent-green-500 h-5 w-5"
                            aria-label="Set completed"
                          />
                          <Input
                            type="number"
                            placeholder="Reps"
                            value={set.reps}
                            onChange={e => handleSetChange(exIdx, setIdx, 'reps', Number(e.target.value))}
                            className="w-16 sm:w-20 text-xs sm:text-base"
                          />
                          <Input
                            type="number"
                            placeholder="Weight (kg)"
                            value={set.weight}
                            onChange={e => handleSetChange(exIdx, setIdx, 'weight', Number(e.target.value))}
                            className="w-20 sm:w-28 text-xs sm:text-base"
                          />
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveSet(exIdx, setIdx)}>
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                          {/* Timer UI for each set */}
                          <div className="flex items-center gap-1 ml-2">
                            <span className="text-xs font-mono">{formatTime(setTimers[getSetKey(exIdx, setIdx)] || 0)}</span>
                            <Button size="icon" variant="ghost" onClick={() => startSetTimer(exIdx, setIdx)} disabled={setTimerActive[getSetKey(exIdx, setIdx)]}>▶️</Button>
                            <Button size="icon" variant="ghost" onClick={() => stopSetTimer(exIdx, setIdx)} disabled={!setTimerActive[getSetKey(exIdx, setIdx)]}>⏸️</Button>
                            <Button size="icon" variant="ghost" onClick={() => resetSetTimer(exIdx, setIdx)}>⏹️</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1" onClick={() => handleAddSet(exIdx)}>
                      <Plus className="mr-1 h-4 w-4" /> Add Set
                    </Button>
                  </div>

                  {/* Extra Sets */}
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-medium text-foreground-muted">Extra Sets</h4>
                      <div className="text-xs text-foreground-muted">
                        {ex.extraSets.filter(s => s.completed).length}/{ex.extraSets.length} Completed
                      </div>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      {ex.extraSets.map((set, setIdx) => (
                        <div key={setIdx} className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <input
                            type="checkbox"
                            checked={!!set.completed}
                            onChange={e => handleExtraSetCompleted(exIdx, setIdx, e.target.checked)}
                            className="accent-green-500 h-5 w-5"
                            aria-label="Extra set completed"
                          />
                          <Input
                            type="number"
                            placeholder="Reps"
                            value={set.reps}
                            onChange={e => handleExtraSetChange(exIdx, setIdx, 'reps', Number(e.target.value))}
                            className="w-16 sm:w-20 text-xs sm:text-base"
                          />
                          <Input
                            type="number"
                            placeholder="Weight (kg)"
                            value={set.weight}
                            onChange={e => handleExtraSetChange(exIdx, setIdx, 'weight', Number(e.target.value))}
                            className="w-20 sm:w-28 text-xs sm:text-base"
                          />
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveExtraSet(exIdx, setIdx)}>
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                          {/* Timer UI for each set */}
                          <div className="flex items-center gap-1 ml-2">
                            <span className="text-xs font-mono">{formatTime(setTimers[getSetKey(exIdx, setIdx, true)] || 0)}</span>
                            <Button size="icon" variant="ghost" onClick={() => startSetTimer(exIdx, setIdx, true)} disabled={setTimerActive[getSetKey(exIdx, setIdx, true)]}>▶️</Button>
                            <Button size="icon" variant="ghost" onClick={() => stopSetTimer(exIdx, setIdx, true)} disabled={!setTimerActive[getSetKey(exIdx, setIdx, true)]}>⏸️</Button>
                            <Button size="icon" variant="ghost" onClick={() => resetSetTimer(exIdx, setIdx, true)}>⏹️</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  
                  </div>
                </div>

                <Textarea
                  placeholder="Notes (optional)"
                  value={ex.notes}
                  onChange={e => handleExerciseNotes(exIdx, e.target.value)}
                  className="mt-2 sm:mt-4 text-xs sm:text-base"
                />
              </motion.div>
            )
          })}
          <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1" onClick={handleAddExercise}>
            <Plus className="mr-1 h-4 w-4" /> Add Exercise
          </Button>
        </div>

        {/* Completion Summary */}
        {workoutProgress.completedExercises > 0 && (
          <div className="rounded-xl border border-border bg-card p-2 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold mb-2">Completion Summary</h3>
            <div className="space-y-1 sm:space-y-2">
              {exercises.filter(e => e.completed).map((ex, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{ex.name}</span>
                  <span className="text-foreground-muted">
                    ({ex.sets.filter(s => s.completed).length + ex.extraSets.filter(s => s.completed).length} sets)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mood Selector */}
        <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-4 flex-wrap">
          <span className="text-xs sm:text-sm text-foreground-muted">How did you feel?</span>
          <Button
            variant={mood === '😄' ? 'default' : 'outline'}
            size="icon"
            className="text-lg sm:text-xl"
            onClick={() => setMood(mood === '😄' ? undefined : '😄')}
          >😄</Button>
          <Button
            variant={mood === '😐' ? 'default' : 'outline'}
            size="icon"
            className="text-lg sm:text-xl"
            onClick={() => setMood(mood === '😐' ? undefined : '😐')}
          >😐</Button>
          <Button
            variant={mood === '😫' ? 'default' : 'outline'}
            size="icon"
            className="text-lg sm:text-xl"
            onClick={() => setMood(mood === '😫' ? undefined : '😫')}
          >😫</Button>
        </div>

        {/* Save and Complete Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button
            className="flex-1 h-10 sm:h-12 text-base sm:text-lg"
            variant={workoutCompleted ? "default" : "outline"}
            onClick={handleWorkoutComplete}
            disabled={
              exercises.length === 0 ||
              exercises.some(e => !e.name) ||
              exercises.some(e =>
                e.sets.length === 0 ||
                e.sets.some(s => !s.completed) ||
                e.extraSets.some(s => !s.completed)
              )
            }
          >
            <Check className="mr-2 h-5 w-5" />
            {workoutCompleted ? 'Workout Completed' : 'Complete Workout'}
          </Button>
        </div>
      </div>
    </div>
  )
}
