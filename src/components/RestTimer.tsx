import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Timer, Pause, Play, SkipForward } from 'lucide-react'

interface RestTimerProps {
  duration: number // in seconds
  onComplete?: () => void
  autoStart?: boolean
}

export default function RestTimer({
  duration,
  onComplete,
  autoStart = false,
}: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isPaused, setIsPaused] = useState(false)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const resetTimer = useCallback(() => {
    setTimeLeft(duration)
    setIsRunning(false)
    setIsPaused(false)
  }, [duration])

  const skipTimer = useCallback(() => {
    if (onComplete) onComplete()
    resetTimer()
  }, [onComplete, resetTimer])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            if (onComplete) onComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, isPaused, timeLeft, onComplete])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-accent/10 p-2">
          <Timer className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Rest Timer</h3>
          <p className="text-2xl font-bold text-foreground">
            {formatTime(timeLeft)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isRunning ? (
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="rounded-full bg-accent p-2 text-accent-foreground hover:bg-accent/80"
          >
            {isPaused ? (
              <Play className="h-5 w-5" />
            ) : (
              <Pause className="h-5 w-5" />
            )}
          </button>
        ) : (
          <button
            onClick={() => setIsRunning(true)}
            className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90"
          >
            <Play className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={skipTimer}
          className="rounded-full bg-background p-2 text-foreground hover:bg-accent/50"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  )
} 