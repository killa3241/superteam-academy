"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { mockCourses } from "@/domain/mockCourses"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params?.id as string

  const course = mockCourses.find((c) => c.id === courseId)

  const [completedLessons, setCompletedLessons] = useState<number[]>([])

  // --- Read completed lessons from localStorage ---
  useEffect(() => {
    if (!course) return

    const stored = localStorage.getItem(`completed_${courseId}`)
    if (stored) {
      setCompletedLessons(JSON.parse(stored))
    }
  }, [courseId, course])

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
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold">{course.title}</h1>
          <Badge className="bg-indigo-100 text-indigo-800">
            {course.difficulty}
          </Badge>
        </div>

        <p className="text-muted-foreground text-lg max-w-2xl">
          {course.description}
        </p>

        <div className="flex gap-8 text-sm text-muted-foreground pt-4">
          <span>Lessons: {course.lessonCount}</span>
          <span>XP per Lesson: {course.xpPerLesson}</span>
          <span>Total XP: {totalXP}</span>
        </div>
      </div>

      {/* --- Dynamic Progress --- */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Your Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} />
      </div>

      {/* Lessons */}
      <div className="space-y-4">
        {course.lessons.map((lesson, index) => {
          const isCompleted = completedLessons.includes(lesson.id)

          return (
            <div
              key={lesson.id}
              className="flex justify-between items-center border rounded-xl p-5 hover:shadow-md transition"
            >
              <div className="space-y-1">
                <p className="font-semibold">
                  Lesson {index + 1}: {lesson.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lesson.type === "challenge"
                    ? "🧪 Challenge"
                    : "📖 Content"}{" "}
                  • {lesson.xpReward} XP
                  {isCompleted && (
                    <span className="ml-2 text-green-600 font-medium">
                      ✓ Completed
                    </span>
                  )}
                </p>
              </div>

              <Link
                href={`/courses/${course.id}/lessons/${lesson.id}`}
              >
                <Button variant={isCompleted ? "outline" : "default"}>
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