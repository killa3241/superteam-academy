"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import Link from "next/link"

import { mockCourses } from "@/domain/mockCourses"
import { useLearningProgressService } from "@/services/LearningProgressService"
import { LessonBitmap } from "@/lib/utils/lesson-bitmap"

import { LessonLayout } from "@/components/lesson/LessonLayout"
import { LessonContent } from "@/components/lesson/LessonContent"
import { LessonEditor } from "@/components/lesson/LessonEditor"
import { Button } from "@/components/ui/button"

export default function LessonPage() {
  const params = useParams()
  const wallet = useWallet()

  const courseId = params?.id as string
  const lessonId = Number(params?.lessonId)

  const learningService = useLearningProgressService()

  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)

  const course = mockCourses.find((c) => c.id === courseId)
  const lesson = course?.lessons.find((l) => l.id === lessonId)

  // --- Lesson position logic ---
  const lessonIndex = useMemo(() => {
    if (!course) return -1
    return course.lessons.findIndex((l) => l.id === lessonId)
  }, [course, lessonId])

  const totalLessons = course?.lessons.length ?? 0

  const previousLesson =
    lessonIndex > 0 ? course?.lessons[lessonIndex - 1] : null

  const nextLesson =
    lessonIndex < totalLessons - 1
      ? course?.lessons[lessonIndex + 1]
      : null

  // --- NEW: Read completion from bitmap ---
  useEffect(() => {
    if (!wallet.publicKey || lessonIndex < 0) return

    const key = `superteam:${wallet.publicKey.toBase58()}:lessons:${courseId}`
    const raw = localStorage.getItem(key)

    if (!raw) {
      setCompleted(false)
      return
    }

    const flags: number[] = JSON.parse(raw)

    const wordIndex = Math.floor(lessonIndex / 32)
    const bitIndex = lessonIndex % 32
    const mask = 1 << bitIndex

    const isCompleted = (flags[wordIndex] & mask) !== 0
    setCompleted(isCompleted)

  }, [wallet.publicKey, lessonIndex, courseId])

  if (!course || !lesson) {
    return <div className="p-8">Lesson not found.</div>
  }

  const handleComplete = async () => {
    if (!learningService) return

    setLoading(true)
    await learningService.completeLesson(courseId, lessonIndex)
    setCompleted(true)
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <LessonLayout
        left={
          <LessonContent
            title={lesson.title}
            xpReward={lesson.xpReward}
            completed={completed}
            loading={loading}
            onComplete={handleComplete}
            currentIndex={lessonIndex}
            totalLessons={totalLessons}
          />
        }
        right={<LessonEditor />}
      />

      <div className="flex justify-between items-center">
        {previousLesson ? (
          <Button variant="outline" asChild>
            <Link
              href={`/courses/${courseId}/lessons/${previousLesson.id}`}
            >
              ← Previous
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Button asChild>
            <Link
              href={`/courses/${courseId}/lessons/${nextLesson.id}`}
            >
              Next →
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}