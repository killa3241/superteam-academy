export type Difficulty = "Beginner" | "Intermediate" | "Advanced"

export interface LessonDefinition {
  id: number
  title: string
  type: "content" | "challenge"
  xpReward: number
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

/* -------------------------------------------------------------------------- */
/*                               MOCK COURSES                                 */
/* -------------------------------------------------------------------------- */

export const mockCourses: CourseDefinition[] = [
  {
    id: "solana-fundamentals",
    title: "Solana Fundamentals",
    description: "Learn how Solana works from accounts to transactions.",
    difficulty: "Beginner",
    lessonCount: 5,
    xpPerLesson: 25,
    trackId: "core",
    trackLevel: 1,
    lessons: [
      { id: 0, title: "What is Solana?", type: "content", xpReward: 25 },
      { id: 1, title: "Accounts Model", type: "content", xpReward: 25 },
      { id: 2, title: "Transactions & Signers", type: "content", xpReward: 25 },
      { id: 3, title: "Write Your First Program", type: "challenge", xpReward: 40 },
      { id: 4, title: "Deploy to Devnet", type: "challenge", xpReward: 40 },
    ],
  },
  {
    id: "anchor-mastery",
    title: "Anchor Mastery",
    description: "Build production-ready Solana programs using Anchor.",
    difficulty: "Intermediate",
    lessonCount: 6,
    xpPerLesson: 40,
    trackId: "core",
    trackLevel: 2,
    lessons: [
      { id: 0, title: "Anchor Project Structure", type: "content", xpReward: 40 },
      { id: 1, title: "PDAs Explained", type: "content", xpReward: 40 },
      { id: 2, title: "Account Constraints", type: "content", xpReward: 40 },
      { id: 3, title: "Token-2022 Integration", type: "challenge", xpReward: 60 },
      { id: 4, title: "CPI Patterns", type: "challenge", xpReward: 60 },
      { id: 5, title: "Testing with Anchor", type: "challenge", xpReward: 60 },
    ],
  },
]