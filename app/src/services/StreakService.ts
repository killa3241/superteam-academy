import type { IStreakService } from "./interfaces/IStreakService"
import type { PublicKey } from "@solana/web3.js"

interface StreakData {
  currentStreak: number
  lastCompletedDate: string | null
}

export class StreakService implements IStreakService {

  private getKey(wallet: PublicKey) {
    return `superteam:${wallet.toBase58()}:streak`
  }

  private getToday(): string {
    return new Date().toISOString().split("T")[0]
  }

  getCurrentStreak(wallet: PublicKey): number {
    if (typeof window === "undefined") return 0

    const raw = localStorage.getItem(this.getKey(wallet))
    if (!raw) return 0

    const data: StreakData = JSON.parse(raw)
    return data.currentStreak
  }

  updateStreak(wallet: PublicKey): void {
    if (typeof window === "undefined") return

    const key = this.getKey(wallet)
    const today = this.getToday()

    const raw = localStorage.getItem(key)

    if (!raw) {
      const initial: StreakData = {
        currentStreak: 1,
        lastCompletedDate: today,
      }
      localStorage.setItem(key, JSON.stringify(initial))
      return
    }

    const data: StreakData = JSON.parse(raw)

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    if (data.lastCompletedDate === today) {
      return
    }

    if (data.lastCompletedDate === yesterdayStr) {
      data.currentStreak += 1
    } else {
      data.currentStreak = 1
    }

    data.lastCompletedDate = today
    localStorage.setItem(key, JSON.stringify(data))
  }
}