import type { ILeaderboardService } from "./interfaces/ILeaderboardService"
import type { LeaderboardEntry } from "@/domain/types"
import type { PublicKey } from "@solana/web3.js"
import { deriveLevel } from "@/domain/level"

export class LeaderboardService implements ILeaderboardService {

  async getTopUsers(limit: number): Promise<LeaderboardEntry[]> {
    const mock = [
      { wallet: "abc1", username: "Alice", xp: 1200 },
      { wallet: "abc2", username: "Bob", xp: 900 },
      { wallet: "abc3", username: "Charlie", xp: 600 },
    ]

    return mock
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit)
      .map((u, index) => ({
        rank: index + 1,
        wallet: u.wallet,
        username: u.username,
        xp: u.xp,
        level: deriveLevel(u.xp),
      }))
  }

  async getUserRank(wallet: PublicKey): Promise<number> {
    const users = await this.getTopUsers(100)
    const index = users.findIndex(u => u.wallet === wallet.toBase58())
    return index === -1 ? -1 : index + 1
  }
}