import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

export default function LogPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workout Log</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Log Workout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <Input placeholder="Exercise name" className="flex-1" />
                <Input type="number" placeholder="Sets" className="w-20" />
                <Input type="number" placeholder="Reps" className="w-20" />
                <Input type="number" placeholder="Weight" className="w-24" />
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button>Save Log</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
