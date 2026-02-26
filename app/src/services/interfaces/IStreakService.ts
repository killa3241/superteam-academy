import { PublicKey } from "@solana/web3.js"

export interface IStreakService {
  getCurrentStreak(wallet: PublicKey): number
  updateStreak(wallet: PublicKey): void
}