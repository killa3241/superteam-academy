import { Certificate } from "@/domain/types"

export class CertificateService {
  static getCertificate(id: string): Certificate {
    return {
      id,
      courseId: "solana-fundamentals",
      courseTitle: "Solana Fundamentals",
      recipientWallet: "mock-wallet",
      issuedAt: new Date().toISOString(),
      xpEarned: 125,
      mintAddress: "MockMintAddress123",
    }
  }
}