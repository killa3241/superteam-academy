import type { PublicKey } from "@solana/web3.js"
import type { LeaderboardEntry } from "@/domain/types"

export interface ILeaderboardService {
  getTopUsers(limit: number): Promise<LeaderboardEntry[]>
  getUserRank(wallet: PublicKey): Promise<number>
}