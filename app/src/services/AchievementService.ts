import type { PublicKey } from "@solana/web3.js"

export type AchievementType =
  | "FIRST_LESSON"
  | "FIVE_LESSONS"
  | "FIRST_COURSE"
  | "SEVEN_DAY_STREAK"
  | "XP_1000"

export interface Achievement {
  type: AchievementType
  unlockedAt: number
}

export class AchievementService {

  private getKey(wallet: PublicKey) {
    return `superteam:${wallet.toBase58()}:achievements`
  }

  getAchievements(wallet: PublicKey): Achievement[] {
    if (typeof window === "undefined") return []
    const raw = localStorage.getItem(this.getKey(wallet))
    if (!raw) return []
    return JSON.parse(raw)
  }

  private save(wallet: PublicKey, achievements: Achievement[]) {
    localStorage.setItem(
      this.getKey(wallet),
      JSON.stringify(achievements)
    )
  }

  unlock(wallet: PublicKey, type: AchievementType) {
    const achievements = this.getAchievements(wallet)

    if (achievements.some(a => a.type === type)) return

    achievements.push({
      type,
      unlockedAt: Date.now(),
    })

    this.save(wallet, achievements)
  }
}