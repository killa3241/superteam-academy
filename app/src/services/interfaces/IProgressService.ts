import { PublicKey } from "@solana/web3.js"

export interface IProgressService {
  getXpBalance(wallet: PublicKey): Promise<number>
  getLevel(wallet: PublicKey): Promise<number>
  completeLesson(wallet: PublicKey, lessonId: string): Promise<void>
}