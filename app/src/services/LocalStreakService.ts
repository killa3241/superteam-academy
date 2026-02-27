import type { IStreakService } from "./interfaces/IStreakService"
import type { PublicKey } from "@solana/web3.js"

export class LocalStreakService implements IStreakService {

  private getKey(wallet: PublicKey) {
    return `superteam:streak:${wallet.toBase58()}`
  }

  getCurrentStreak(wallet: PublicKey): number {
    if (typeof window === "undefined") return 0
    return Number(localStorage.getItem(this.getKey(wallet)) ?? 0)
  }

  updateStreak(wallet: PublicKey): void {
    if (typeof window === "undefined") return
    const current = this.getCurrentStreak(wallet)
    localStorage.setItem(this.getKey(wallet), String(current + 1))
  }
}