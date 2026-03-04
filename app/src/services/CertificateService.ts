import { Certificate } from "@/domain/types";

export class CertificateService {
  static getCertificate(id: string): Certificate {
    // Extract wallet from localStorage profile key
    const walletKeys = Object.keys(localStorage).filter((key) =>
      key.includes(":profile")
    );

    let recipientWallet = "Unknown";

    if (walletKeys.length > 0) {
      const profileKey = walletKeys[0];
      const wallet = profileKey.split(":")[1];
      recipientWallet = wallet;
    }

    return {
      id,
      courseId: id, // IMPORTANT: Route param should match course.id
      recipientWallet, // Store actual wallet, not display name
      issuedAt: new Date().toISOString(),
      xpEarned: 125,
      mintAddress: "MockMintAddress123",
    };
  }
  
}