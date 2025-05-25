import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  GripVertical, 
  Edit2, 
  Trash2,
  Clock,
  Dumbbell,
  Target,
  AlertCircle
} from 'lucide-react'
import { workoutPlan, WorkoutDay, Exercise } from '../data/workoutPlan'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd'

export default function WorkoutPlan() {
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [plan, setPlan] = useState<WorkoutDay[]>(workoutPlan)
  const [editingExercise, setEditingExercise] = useState<{ dayIndex: number; exerciseIndex: number } | null>(null)
  const [newExercise, setNewExercise] = useState<Partial<Exercise>>({})

  // Load saved workout data from localStorage
  useEffect(() => {
    const savedPlan = localStorage.getItem('workoutPlan')
    if (savedPlan) {
      setPlan(JSON.parse(savedPlan))
    }
  }, [])

  // Save workout data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('workoutPlan', JSON.stringify(plan))
  }, [plan])

  const toggleDay = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day)
  }

  const toggleExercise = (dayIndex: number, exerciseIndex: number) => {
    const newPlan = [...plan]
    newPlan[dayIndex].exercises[exerciseIndex].completed = 
      !newPlan[dayIndex].exercises[exerciseIndex].completed
    setPlan(newPlan)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const newPlan = [...plan]
    const sourceIndex = parseInt(source.droppableId)
    const destIndex = parseInt(destination.droppableId)
    const [removed] = newPlan[sourceIndex].exercises.splice(source.index, 1)
    newPlan[destIndex].exercises.splice(destination.index, 0, removed)
    setPlan(newPlan)
  }

  const addExercise = (dayIndex: number) => {
    if (!newExercise.name) return

    const newPlan = [...plan]
    newPlan[dayIndex].exercises.push({
      name: newExercise.name,
      sets: newExercise.sets || 3,
      reps: newExercise.reps || 10,
      weight: newExercise.weight || 0,
      notes: newExercise.notes
    })
    setPlan(newPlan)
    setNewExercise({})
  }

  const updateExercise = (dayIndex: number, exerciseIndex: number, updates: Partial<Exercise>) => {
    const newPlan = [...plan]
    newPlan[dayIndex].exercises[exerciseIndex] = {
      ...newPlan[dayIndex].exercises[exerciseIndex],
      ...updates
    }
    setPlan(newPlan)
    setEditingExercise(null)
  }

  const deleteExercise = (dayIndex: number, exerciseIndex: number) => {
    const newPlan = [...plan]
    newPlan[dayIndex].exercises.splice(exerciseIndex, 1)
    setPlan(newPlan)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between ">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Weekly Workout Plan</h1>
          <p className="text-sm text-foreground-muted">Plan and organize your weekly workouts</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Plan
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-4">
          {plan.map((day, dayIndex) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.1 }}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <button
                onClick={() => toggleDay(day.day)}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <span className="text-lg font-semibold text-foreground">{day.day}</span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-accent px-2 py-1 text-xs text-accent-foreground">
                        {day.focus}
                      </span>
                      <span className="text-sm text-foreground-muted">
                        {day.exercises.length} exercises
                      </span>
                    </div>
                  </div>
                </div>
                {expandedDay === day.day ? (
                  <ChevronUp className="h-5 w-5 text-foreground-muted" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-foreground-muted" />
                )}
              </button>

              <AnimatePresence>
                {expandedDay === day.day && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-4"
                  >
                    <Droppable droppableId={dayIndex.toString()}>
                      {(provided: DroppableProvided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-3"
                        >
                          {day.exercises.map((exercise, exerciseIndex) => (
                            <Draggable
                              key={exercise.name}
                              draggableId={`${dayIndex}-${exerciseIndex}`}
                              index={exerciseIndex}
                            >
                              {(provided: DraggableProvided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="group relative rounded-lg border border-border bg-background p-4"
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100"
                                  >
                                    <GripVertical className="h-4 w-4 text-foreground-muted" />
                                  </div>

                                  {editingExercise?.dayIndex === dayIndex && 
                                   editingExercise?.exerciseIndex === exerciseIndex ? (
                                    <div className="ml-6 space-y-3">
                                      <Input
                                        placeholder="Exercise name"
                                        value={exercise.name}
                                        onChange={(e) => updateExercise(dayIndex, exerciseIndex, { name: e.target.value })}
                                      />
                                      <div className="grid grid-cols-3 gap-2">
                                        <Input
                                          type="number"
                                          placeholder="Sets"
                                          value={exercise.sets}
                                          onChange={(e) => updateExercise(dayIndex, exerciseIndex, { sets: Number(e.target.value) })}
                                        />
                                        <Input
                                          type="number"
                                          placeholder="Reps"
                                          value={exercise.reps}
                                          onChange={(e) => updateExercise(dayIndex, exerciseIndex, { reps: Number(e.target.value) })}
                                        />
                                        <Input
                                          type="number"
                                          placeholder="Weight (kg)"
                                          value={exercise.weight}
                                          onChange={(e) => updateExercise(dayIndex, exerciseIndex, { weight: Number(e.target.value) })}
                                        />
                                      </div>
                                      <Textarea
                                        placeholder="Notes (optional)"
                                        value={exercise.notes}
                                        onChange={(e) => updateExercise(dayIndex, exerciseIndex, { notes: e.target.value })}
                                      />
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setEditingExercise(null)}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => setEditingExercise(null)}
                                        >
                                          Save
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="ml-6 flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h3 className="font-medium text-foreground">{exercise.name}</h3>
                                          <button
                                            onClick={() => toggleExercise(dayIndex, exerciseIndex)}
                                            className={`rounded-full p-1 transition-colors ${
                                              exercise.completed
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-accent/50 text-accent-foreground hover:bg-accent'
                                            }`}
                                          >
                                            <Check className="h-4 w-4" />
                                          </button>
                                        </div>
                                        <div className="mt-1 flex items-center gap-4 text-sm text-foreground-muted">
                                          <span className="flex items-center gap-1">
                                            <Dumbbell className="h-4 w-4" />
                                            {exercise.sets} sets × {exercise.reps} reps
                                          </span>
                                          {exercise.weight && exercise.weight > 0 && (
                                            <span className="flex items-center gap-1">
                                              <Target className="h-4 w-4" />
                                              {exercise.weight}kg
                                            </span>
                                          )}
                                        </div>
                                        {exercise.notes && (
                                          <p className="mt-1 text-sm text-foreground-muted">
                                            {exercise.notes}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setEditingExercise({ dayIndex, exerciseIndex })}
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-destructive"
                                          onClick={() => deleteExercise(dayIndex, exerciseIndex)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    <div className="rounded-lg border border-dashed border-border p-4">
                      <div className="space-y-3">
                        <Input
                          placeholder="Exercise name"
                          value={newExercise.name || ''}
                          onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            type="number"
                            placeholder="Sets"
                            value={newExercise.sets || ''}
                            onChange={(e) => setNewExercise({ ...newExercise, sets: Number(e.target.value) })}
                          />
                          <Input
                            type="number"
                            placeholder="Reps"
                            value={newExercise.reps || ''}
                            onChange={(e) => setNewExercise({ ...newExercise, reps: Number(e.target.value) })}
                          />
                          <Input
                            type="number"
                            placeholder="Weight (kg)"
                            value={newExercise.weight || ''}
                            onChange={(e) => setNewExercise({ ...newExercise, weight: Number(e.target.value) })}
                          />
                        </div>
                        <Textarea
                          placeholder="Notes (optional)"
                          value={newExercise.notes || ''}
                          onChange={(e) => setNewExercise({ ...newExercise, notes: e.target.value })}
                        />
                        <Button
                          className="w-full"
                          onClick={() => addExercise(dayIndex)}
                          disabled={!newExercise.name}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Exercise
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
