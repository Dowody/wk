import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Plus } from 'lucide-react'
import { WorkoutPlan } from '../types/workout'

export default function Plan() {
  const [plans] = useState<WorkoutPlan[]>([
    {
      id: '1',
      name: 'Push Day',
      exercises: [
        { name: 'Bench Press', sets: 3, reps: 10, weight: 60 },
        { name: 'Shoulder Press', sets: 3, reps: 12, weight: 40 },
        { name: 'Tricep Pushdowns', sets: 3, reps: 15, weight: 30 },
      ],
    },
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workout Plans</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.exercises.map((exercise, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    {exercise.name}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm">Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
