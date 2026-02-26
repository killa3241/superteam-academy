export interface CourseDefinition {
  id: string
  title: string
  description: string
  lessonCount: number
  xpPerLesson: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
}