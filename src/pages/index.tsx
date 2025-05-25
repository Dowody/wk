import { WorkoutPlan } from "@/components/WorkoutPlan"
import { WorkoutLogger } from "@/components/WorkoutLogger"

export default function HomePage() {
  return (
    <div className="container max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-muted" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-lg font-semibold text-muted-foreground">
            Fitness Tracker
          </span>
        </div>
      </div>
      
      <WorkoutPlan />
      <WorkoutLogger />
    </div>
  )
}
