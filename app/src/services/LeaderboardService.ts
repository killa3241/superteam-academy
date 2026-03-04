import type { ILeaderboardService } from "./interfaces/ILeaderboardService"
import type { LeaderboardEntry } from "@/domain/types"
import type { PublicKey } from "@solana/web3.js"
import { deriveLevel } from "@/domain/level"

export class LeaderboardService implements ILeaderboardService {

  /* -------------------- INTERNAL -------------------- */

  private getAllXpEntries(): { wallet: string; xp: number }[] {
    if (typeof window === "undefined") return []

    return Object.keys(localStorage)
      .filter(key => key.startsWith("superteam:") && key.endsWith(":xp"))
      .map(key => {
        const parts = key.split(":")
        const wallet = parts[1]
        const xp = parseInt(localStorage.getItem(key) ?? "0", 10)

        return {
          wallet,
          xp: isNaN(xp) ? 0 : xp,
        }
      })
      .filter(entry => entry.xp > 0)
  }

  /* -------------------- PUBLIC -------------------- */

  async getTopUsers(limit: number): Promise<LeaderboardEntry[]> {
    const entries = this.getAllXpEntries()

    return entries
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit)
      .map((u, index) => ({
        rank: index + 1,
        wallet: u.wallet,
        xp: u.xp,
        level: deriveLevel(u.xp),
      }))
  }

  async getUserRank(wallet: PublicKey): Promise<number> {
    const entries = await this.getTopUsers(100)
    const index = entries.findIndex(
      entry => entry.wallet === wallet.toBase58()
    )

    return index === -1 ? -1 : index + 1
  }
}