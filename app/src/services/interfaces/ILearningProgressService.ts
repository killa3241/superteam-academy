import { BN } from "@coral-xyz/anchor"
import type { CourseDefinition } from "@/domain/courses"
import type { UserProgressData } from "../LearningProgressService"

export interface ILearningProgressService {
  getAllCourses(): Promise<CourseDefinition[]>
  getCourse(courseId: string): Promise<CourseDefinition | null>
  enrollInCourse(courseId: string): Promise<string>
  completeLesson(courseId: string, lessonIndex: number): Promise<string>
  getUserXPBalance(): Promise<BN>
  getUserLevel(): Promise<number>
  getUserProgress(): Promise<UserProgressData[]>
  ensureXPTokenAccount(): Promise<void>
}