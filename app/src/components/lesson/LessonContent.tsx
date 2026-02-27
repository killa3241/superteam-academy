"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useXpAnimation } from "@/context/XpAnimationContext"

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

  const { xpAnimation } = useXpAnimation()
  const [showFloatingXp, setShowFloatingXp] = useState(false)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (!xpAnimation) return

    setShowFloatingXp(true)
    setPulse(true)

    const timer = setTimeout(() => {
      setShowFloatingXp(false)
      setPulse(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [xpAnimation])

  return (
    <div className="space-y-8">

      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        Lesson {currentIndex + 1} of {totalLessons}
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">
        {title}
      </h1>

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

      <hr className="border-muted" />

      <div
        className={`relative rounded-2xl border bg-muted/30 p-6 flex justify-between items-center transition-all duration-300 ${
          pulse ? "scale-105 border-green-500 shadow-lg" : ""
        }`}
      >

        {showFloatingXp && xpAnimation && (
          <div className="absolute right-8 -top-2 text-green-600 font-semibold animate-float-up pointer-events-none">
            +{xpAnimation.amount} XP
          </div>
        )}

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
          <div className="flex items-center gap-2 text-green-600 font-medium animate-fade-in">
            <CheckCircle className="w-5 h-5" />
            Completed
          </div>
        )}

      </div>

    </div>
  )
}