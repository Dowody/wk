import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useWorkoutPlan } from "../hooks/useWorkoutPlan"
import { Dumbbell, Check } from "lucide-react"

export function WorkoutPlan() {
  const { plan, toggleWorkoutComplete } = useWorkoutPlan()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Weekly Plan</h2>
          <p className="text-muted-foreground mt-2">Track your workout progress throughout the week</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plan.days.map((day) => (
          <Card key={day.id} className={`group transition-all duration-300 hover:shadow-lg ${day.isCompleted ? 'bg-primary/5 border-primary/20' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${day.isCompleted ? 'bg-primary/10' : 'bg-secondary'}`}>
                  {day.exercises.length > 0 ? (
                    <Dumbbell className={`h-5 w-5 ${day.isCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
                  ) : (
                    <Check className={`h-5 w-5 ${day.isCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {day.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {day.exercises.length} exercises
                  </p>
                </div>
              </div>
              <Checkbox
                checked={day.isCompleted}
                onCheckedChange={() => toggleWorkoutComplete(day.id)}
                className="h-6 w-6 transition-transform duration-300 group-hover:scale-110"
              />
            </CardHeader>
            <CardContent>
              {day.exercises.length > 0 ? (
                <ul className="space-y-3">
                  {day.exercises.map((exercise) => (
                    <li key={exercise.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{exercise.name}</span>
                      <span className="text-muted-foreground">
                        {exercise.sets} × {exercise.reps}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center justify-center py-6">
                  <p className="text-sm text-muted-foreground">Rest & Recovery Day</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
