"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface LessonContentProps {
  title: string
  content: string
  xpReward: number
  completed: boolean
  loading: boolean
  onComplete: () => void
  currentIndex: number
  totalLessons: number
}

export function LessonContent({
  title,
  content,
  xpReward,
  completed,
  loading,
  onComplete,
  currentIndex,
  totalLessons,
}: LessonContentProps) {
  return (
    <div className="space-y-8">

      {/* Progress Indicator */}
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        Lesson {currentIndex + 1} of {totalLessons}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-semibold tracking-tight">
        {title}
      </h1>

      {/* Content */}
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        {content.split("\n").map((line, index) => {
          if (line.trim().startsWith("- ")) {
            return (
              <li key={index} className="ml-6 list-disc">
                {line.replace("- ", "")}
              </li>
            )
          }

          if (line.trim() === "") return null

          return <p key={index}>{line}</p>
        })}
      </div>

      {/* Divider */}
      <hr className="border-muted" />

      {/* Reward Card */}
      <div className="rounded-2xl border bg-muted/30 p-6 flex justify-between items-center">

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Reward
          </p>
          <p className="text-2xl font-semibold">
            {xpReward} XP
          </p>
        </div>

        {!completed ? (
          <Button size="sm" onClick={onComplete} disabled={loading}>
            {loading ? "Completing..." : "Mark as Complete"}
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <CheckCircle className="w-5 h-5" />
            Completed
          </div>
        )}

      </div>

    </div>
  )
}