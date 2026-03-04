export interface UserProfile {
  wallet: string
  username: string
  avatarUrl?: string
  bio?: string
  xp: number
  streak: number
  completedCourses: string[]
  isPublic: boolean
}

export type LeaderboardPeriod = "weekly" | "monthly" | "all-time"

export interface LeaderboardEntry {
  rank: number
  wallet: string
  xp: number
  level: number
}

export interface Certificate {
  id: string
  courseId: string
  recipientWallet: string
  issuedAt: string
  xpEarned: number
  mintAddress?: string
}