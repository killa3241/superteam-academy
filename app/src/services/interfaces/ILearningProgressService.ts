import { BN } from "@coral-xyz/anchor";
import type { UserProgressData } from "../LearningProgressService";

export interface ILearningProgressService {
  getAllCourses(): Promise<any[]>;
  getCourse(courseId: string): Promise<any | null>;
  enrollInCourse(courseId: string): Promise<string>;
  completeLesson(courseId: string, lessonIndex: number): Promise<string>;
  getUserXPBalance(): Promise<BN>;
  getUserLevel(): Promise<number>;
  getUserProgress(): Promise<UserProgressData[]>;
  ensureXPTokenAccount(): Promise<void>;
}