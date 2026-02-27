export type Difficulty = "Beginner" | "Intermediate" | "Advanced"

export interface LessonChallenge {
  functionName: string
  expectedReturn: string | boolean | number
}

export interface LessonDefinition {
  id: number
  title: string
  type: "content" | "challenge"
  xpReward: number
  content: string
  starterCode?: string
  challenge?: LessonChallenge
}

export interface CourseDefinition {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  lessonCount: number
  xpPerLesson: number
  trackId: string
  trackLevel: number
  lessons: LessonDefinition[]
}