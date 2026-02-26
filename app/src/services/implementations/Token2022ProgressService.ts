import type { PublicKey } from "@solana/web3.js"
import { getAssociatedTokenAddressSync } from "@solana/spl-token"
import type { IProgressService } from "@/services/interfaces/IProgressService"
import { connection } from "@/lib/solana/connection"
import { deriveLevel } from "@/domain/level"

export class Token2022ProgressService implements IProgressService {
  constructor(private readonly xpMint: PublicKey) {}

  async getXpBalance(wallet: PublicKey): Promise<number> {
    const ata = getAssociatedTokenAddressSync(
      this.xpMint,
      wallet,
      false
    )

    const accountInfo = await connection.getTokenAccountBalance(ata)

    return accountInfo.value.uiAmount ?? 0
  }

  async getLevel(wallet: PublicKey): Promise<number> {
    const xp = await this.getXpBalance(wallet)
    return deriveLevel(xp)
  }

  async completeLesson(wallet: PublicKey, lessonId: string): Promise<void> {
    console.log("Stub lesson completion:", wallet.toBase58(), lessonId)
  }
}