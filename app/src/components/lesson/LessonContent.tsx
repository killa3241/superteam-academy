"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface LessonContentProps {
  title: string
  xpReward: number
  completed: boolean
  loading: boolean
  onComplete: () => void

  // NEW
  currentIndex: number
  totalLessons: number
}

export function LessonContent({
  title,
  xpReward,
  completed,
  loading,
  onComplete,
  currentIndex,
  totalLessons,
}: LessonContentProps) {
  return (
    <div className="space-y-8">
      {/* --- Lesson Position Indicator --- */}
      <div className="text-sm text-muted-foreground">
        Lesson {currentIndex + 1} of {totalLessons}
      </div>

      {/* --- Title --- */}
      <h1 className="text-3xl font-bold tracking-tight">
        {title}
      </h1>

      {/* --- Content Placeholder --- */}
      <p className="text-muted-foreground leading-relaxed">
        This is your lesson content area. Markdown rendering will go here.
      </p>

      {/* --- XP Card --- */}
      <div className="bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 p-4 rounded-xl">
        <p className="font-medium text-indigo-700 dark:text-indigo-300">
          Reward: {xpReward} XP
        </p>
      </div>

      {/* --- Completion State --- */}
      {!completed ? (
        <Button onClick={onComplete} disabled={loading}>
          {loading
            ? "Completing..."
            : `Complete Lesson (+${xpReward} XP)`}
        </Button>
      ) : (
        <div className="flex items-center gap-2 text-green-600 font-medium">
          <CheckCircle className="w-5 h-5" />
          Lesson Completed 🎉
        </div>
      )}
    </div>
  )
}