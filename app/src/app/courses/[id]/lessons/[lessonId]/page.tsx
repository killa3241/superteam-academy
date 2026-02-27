"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import Link from "next/link"

import type { CourseDefinition } from "@/domain/courses"
import { useLearningProgressService } from "@/services/LearningProgressService"
import { LessonBitmap } from "@/lib/utils/lesson-bitmap"

import { LessonLayout } from "@/components/lesson/LessonLayout"
import { LessonContent } from "@/components/lesson/LessonContent"
import { LessonEditor } from "@/components/lesson/LessonEditor"
import { Button } from "@/components/ui/button"

import { useXpAnimation } from "@/context/XpAnimationContext"

export default function LessonPage() {
  const params = useParams()
  const wallet = useWallet()

  const courseId = params?.id as string
  const lessonId = Number(params?.lessonId)

  const learningService = useLearningProgressService()

  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [challengePassed, setChallengePassed] = useState(false)

  const [course, setCourse] = useState<CourseDefinition | null>(null)

  useEffect(() => {
    const loadCourse = async () => {
      if (!learningService || !courseId) return
      const fetched = await learningService.getCourse(courseId)
      setCourse(fetched)
    }

    loadCourse()
  }, [learningService, courseId])

  const lesson = course?.lessons.find((l) => l.id === lessonId)

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

  // Persisted completion read
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
    setChallengePassed(isCompleted)

  }, [wallet.publicKey, lessonIndex, courseId])

  if (!course) {
  return <div className="p-8">Loading lesson...</div>
  }

  if (!lesson) {
    return <div className="p-8">Lesson not found.</div>
  }
  
  const { triggerXpAnimation } = useXpAnimation()
  
  const handleComplete = async () => {
    if (completed) return
    if (!learningService) {
        alert("Wallet not connected or service not ready.")
        return
    }

    if (lesson.type === "challenge" && !challengePassed) {
        alert("Please pass the challenge before completing the lesson.")
        return
    }

    try {
        setLoading(true)

        await learningService.completeLesson(courseId, lessonIndex)

        setCompleted(true)

        
        triggerXpAnimation(lesson.xpReward)

    } catch (err) {
        console.error(err)
        alert("Failed to complete lesson.")
    } finally {
        setLoading(false)
    }
    }
  return (
  <div className="relative min-h-screen flex flex-col">

    {/* Main Content Area */}
    <div className="flex-1 pb-28"> {/* space for footer */}

      {lesson.type === "challenge" ? (
        <LessonLayout
          left={
            <LessonContent
              title={lesson.title}
              content={lesson.content}
              xpReward={lesson.xpReward}
              completed={completed}
              loading={loading || !learningService}
              onComplete={handleComplete}
              currentIndex={lessonIndex}
              totalLessons={totalLessons}
            />
          }
          right={
            <LessonEditor
            lessonType={lesson.type}
            starterCode={lesson.starterCode}
            challenge={lesson.challenge}
            onPass={() => setChallengePassed(true)}
            />
          }
        />
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-10">
          <LessonContent
            title={lesson.title}
            content={lesson.content}
            xpReward={lesson.xpReward}
            completed={completed}
            loading={loading || !learningService}
            onComplete={handleComplete}
            currentIndex={lessonIndex}
            totalLessons={totalLessons}
          />
        </div>
      )}

    </div>

    {/* Fixed Footer Navigation */}
    <div className="fixed bottom-0 left-0 right-0 border-t shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        {previousLesson ? (
          <Button variant="outline" asChild>
            <Link href={`/courses/${courseId}/lessons/${previousLesson.id}`}>
              ← Previous
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Button asChild>
            <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}>
              Next →
            </Link>
          </Button>
        ) : (
          <div />
        )}

      </div>
    </div>

  </div>
)
}