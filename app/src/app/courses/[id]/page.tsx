"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { useLearningProgressService } from "@/services/LearningProgressService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import type { CourseDefinition } from "@/domain/courses"
import { useWallet } from "@solana/wallet-adapter-react"

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params?.id as string

  const learningService = useLearningProgressService()
  const [course, setCourse] = useState<CourseDefinition | null>(null)

  useEffect(() => {
    const loadCourse = async () => {
      if (!learningService || !courseId) return
      const fetched = await learningService.getCourse(courseId)
      setCourse(fetched)
    }

  loadCourse()
}, [learningService, courseId])

  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const wallet = useWallet()  
  // --- Read completed lessons from localStorage ---
  useEffect(() => {
    if (!course || !wallet.publicKey) return

    const key = `superteam:${wallet.publicKey.toBase58()}:lessons:${courseId}`
    const raw = localStorage.getItem(key)

    if (!raw) {
        setCompletedLessons([])
        return
    }

    const flags: number[] = JSON.parse(raw)

    const completedIds: number[] = []

    course.lessons.forEach((lesson, index) => {
        const wordIndex = Math.floor(index / 32)
        const bitIndex = index % 32
        const mask = 1 << bitIndex

        if ((flags[wordIndex] & mask) !== 0) {
        completedIds.push(lesson.id)
        }
    })

    setCompletedLessons(completedIds)
    }, [wallet.publicKey, courseId, course])

  if (!course) {
    return <div className="p-8">Course not found.</div>
  }

  const totalXP = course.lessonCount * course.xpPerLesson

  // --- Progress calculation ---
  const progressPercentage = useMemo(() => {
    if (course.lessonCount === 0) return 0
    return Math.round(
      (completedLessons.length / course.lessonCount) * 100
    )
  }, [completedLessons, course.lessonCount])

return (
  <div className="max-w-6xl mx-auto px-6 py-14 space-y-12">

    {/* Hero Section */}
    <div className="space-y-6">

      <div className="flex items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight">
          {course.title}
        </h1>

        <Badge variant="secondary">
          {course.difficulty}
        </Badge>
      </div>

      <p className="text-muted-foreground text-lg max-w-3xl">
        {course.description}
      </p>

      <div className="flex gap-10 text-sm text-muted-foreground pt-4 border-t pt-6">
        <div>
          <p className="font-medium text-foreground">
            {course.lessonCount}
          </p>
          <p>Lessons</p>
        </div>

        <div>
          <p className="font-medium text-foreground">
            {totalXP}
          </p>
          <p>Total XP</p>
        </div>

        <div>
          <p className="font-medium text-foreground">
            {course.trackLevel}
          </p>
          <p>Track Level</p>
        </div>
      </div>

    </div>

    {/* Progress Section */}
    <div className="rounded-xl border p-6 bg-muted/30 space-y-3">

      <div className="flex justify-between text-sm">
        <span className="font-medium">Your Progress</span>
        <span className="text-muted-foreground">
          {progressPercentage}%
        </span>
      </div>

      <Progress value={progressPercentage} />

    </div>

    {/* Lessons List */}
    <div className="space-y-5">
      {course.lessons.map((lesson, index) => {
        const isCompleted = completedLessons.includes(lesson.id)

        return (
          <div
            key={lesson.id}
            className="flex justify-between items-center border rounded-xl px-6 py-5 hover:shadow-md transition-all duration-200"
          >
            <div className="space-y-2">

              <p className="text-sm text-muted-foreground">
                Lesson {index + 1}
              </p>

              <p className="font-semibold text-lg">
                {lesson.title}
              </p>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                  {lesson.type === "challenge"
                    ? "🧪 Challenge"
                    : "📖 Content"}
                </span>

                <span>•</span>

                <span>{lesson.xpReward} XP</span>

                {isCompleted && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 font-medium">
                      Completed
                    </span>
                  </>
                )}
              </div>

            </div>

            <Link href={`/courses/${course.id}/lessons/${lesson.id}`}>
              <Button
                variant={isCompleted ? "outline" : "default"}
              >
                {isCompleted ? "Review" : "Start"}
              </Button>
            </Link>
          </div>
        )
      })}
    </div>

  </div>
)
}