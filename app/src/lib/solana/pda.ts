import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

export const PROGRAM_ID = new PublicKey("ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf");

export class PDADerivation {
  static getConfigPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      PROGRAM_ID
    );
  }

  static getCoursePDA(courseId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("course"), Buffer.from(courseId)],
      PROGRAM_ID
    );
  }

  static getEnrollmentPDA(courseId: string, learner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("enrollment"), Buffer.from(courseId), learner.toBuffer()],
      PROGRAM_ID
    );
  }

  static getMinterRolePDA(minter: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("minter"), minter.toBuffer()],
      PROGRAM_ID
    );
  }

  static getXPTokenAddress(user: PublicKey, xpMint: PublicKey): PublicKey {
    return getAssociatedTokenAddressSync(
      xpMint,
      user,
      false,
      TOKEN_2022_PROGRAM_ID
    );
  }
}