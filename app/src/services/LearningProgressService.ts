import { Program, BN } from "@coral-xyz/anchor";
import { Connection, SystemProgram, Transaction } from "@solana/web3.js";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import {
  createAssociatedTokenAccountInstruction,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

import { XPCalculator } from "@/lib/utils/xp";
import { LessonBitmap } from "@/lib/utils/lesson-bitmap";
import { PDADerivation } from "@/lib/solana/pda";
import { createProgram } from "@/lib/solana/program";
import { connection } from "@/lib/solana/connection";
import { mockCourses } from "@/domain/mockCourses"

import { ILearningProgressService } from "./interfaces/ILearningProgressService";

/* -------------------------------------------------------------------------- */
/*                                  Types                                     */
/* -------------------------------------------------------------------------- */


type Course = any;
type Enrollment = any;
type Config = any;
export interface UserProgressData {
  course: Course;
  enrollment: Enrollment;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  isCompleted: boolean;
}

/* -------------------------------------------------------------------------- */
/*                           LearningProgressService                          */
/* -------------------------------------------------------------------------- */

export class LearningProgressService implements ILearningProgressService {
  private program: Program;
  private connection: Connection;
  private wallet: AnchorWallet;

  constructor(wallet: AnchorWallet, connection: Connection) {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    this.wallet = wallet;
    this.connection = connection;
    this.program = createProgram(wallet, connection);
  }

  /* ----------------------- LOCAL STORAGE HELPERS ----------------------- */

  private getLocalKey(suffix: string) {
    return `superteam:${this.wallet.publicKey.toBase58()}:${suffix}`
  }

  private getLocalXP(): number {
    if (typeof window === "undefined") return 0
    const raw = localStorage.getItem(this.getLocalKey("xp"))
    return raw ? parseInt(raw, 10) : 0
  }

  private setLocalXP(xp: number) {
    if (typeof window === "undefined") return
    localStorage.setItem(this.getLocalKey("xp"), xp.toString())
  }

  private getLocalLessonFlags(courseId: string): number[] {
    if (typeof window === "undefined") return [0, 0, 0, 0]
    const raw = localStorage.getItem(this.getLocalKey(`lessons:${courseId}`))
    if (!raw) return [0, 0, 0, 0]
    return JSON.parse(raw)
  }

  private setLocalLessonFlags(courseId: string, flags: number[]) {
    if (typeof window === "undefined") return
    localStorage.setItem(
      this.getLocalKey(`lessons:${courseId}`),
      JSON.stringify(flags)
    )
  } 

/* ----------------------------- INTERNAL HELPERS ----------------------------- */

  
  private async confirm(signature: string) {
  const latestBlockhash = await this.connection.getLatestBlockhash();

    await this.connection.confirmTransaction(
      {
        signature,
        ...latestBlockhash,
      },
      "confirmed"
    );
  }

  /* ----------------------------- COURSES ---------------------------------- */

  async getAllCourses(): Promise<Course[]> {
    return mockCourses
  }

  async getCourse(courseId: string): Promise<Course | null> {
      return mockCourses.find((c) => c.id === courseId) ?? null
  }

  /* ----------------------------- ENROLLMENT ------------------------------- */

  async getEnrollment(courseId: string): Promise<Enrollment | null> {
    try {
      const [enrollmentPDA] = PDADerivation.getEnrollmentPDA(
        courseId,
        this.wallet.publicKey
      );

      return await (this.program.account as any).enrollment.fetchNullable(enrollmentPDA);

    } catch (error) {
      console.error("Error fetching enrollment:", error);
      return null;
    }
  }

  async enrollInCourse(courseId: string): Promise<string> {
    const [coursePDA] = PDADerivation.getCoursePDA(courseId);
    const [enrollmentPDA] = PDADerivation.getEnrollmentPDA(
      courseId,
      this.wallet.publicKey
    );

    const tx = await (this.program as any).methods
      .enroll(courseId)
      .accounts({
        course: coursePDA,
        enrollment: enrollmentPDA,
        learner: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const signed = await this.wallet.signTransaction(tx);
    const signature = await this.connection.sendRawTransaction(
      signed.serialize()
    );
    await this.confirm(signature);

    return signature;
  }

  /* ----------------------------- LESSONS ---------------------------------- */

    async completeLesson(courseId: string, lessonIndex: number): Promise<string> {
    const flags = this.getLocalLessonFlags(courseId)

    const wordIndex = Math.floor(lessonIndex / 32)
    const bitIndex = lessonIndex % 32
    const mask = 1 << bitIndex

    if ((flags[wordIndex] & mask) !== 0) {
      return "already-completed"
    }

    flags[wordIndex] |= mask
    this.setLocalLessonFlags(courseId, flags)

    // Stub XP reward (configurable later)
    const xpReward = 25
    const currentXP = this.getLocalXP()
    this.setLocalXP(currentXP + xpReward)

    return "local-stub-success"
  }

  /* ----------------------------- XP -------------------------------------- */

    async getUserXPBalance(): Promise<BN> {
    try {
      const [configPDA] = PDADerivation.getConfigPDA()
      const config = await (this.program.account as any).config.fetch(configPDA)

      const userXpAccount = PDADerivation.getXPTokenAddress(
        this.wallet.publicKey,
        config.xpMint
      )

      const balance = await this.connection.getTokenAccountBalance(
        userXpAccount
      )

      return new BN(balance.value.amount)
    } catch {
      // Fallback to local XP
      return new BN(this.getLocalXP())
    }
  }

  async getUserLevel(): Promise<number> {
    const xp = await this.getUserXPBalance();
    return XPCalculator.calculateLevel(xp);
  }

  /* ----------------------------- PROGRESS -------------------------------- */

  async getUserProgress(): Promise<UserProgressData[]> {
    const courses = await this.getAllCourses();
    const results: UserProgressData[] = [];

    for (const course of courses) {

      const enrollment = await this.getEnrollment(course.id);
      
      const localFlagsNumbers = this.getLocalLessonFlags(course.id);

      const localFlagsBN = localFlagsNumbers.map(n => new BN(n));

      const completedLessons = LessonBitmap.countCompletedLessons(
        localFlagsBN
      );

      const progress = LessonBitmap.calculateProgress(
        localFlagsBN,
        course.lessonCount
      );

      const isCompleted = completedLessons === course.lessonCount;

      results.push({
        course,
        enrollment,
        progress,
        completedLessons,
        totalLessons: course.lessonCount,
        isCompleted,
      });
    }

    return results;
  }
  /* ----------------------- TOKEN ACCOUNT CREATION ------------------------ */

  async ensureXPTokenAccount(): Promise<void> {
    const [configPDA] = PDADerivation.getConfigPDA();
    const config = await (this.program.account as any).config.fetch(configPDA);

    const userXpAccount = PDADerivation.getXPTokenAddress(
      this.wallet.publicKey,
      config.xpMint
    );

    const info = await this.connection.getAccountInfo(userXpAccount);
    if (info) return;

    const ix = createAssociatedTokenAccountInstruction(
      this.wallet.publicKey,     // payer
      userXpAccount,             // associated token address
      this.wallet.publicKey,     // owner
      config.xpMint,             // mint
      TOKEN_2022_PROGRAM_ID
    );

    const tx = new Transaction().add(ix);

    const signed = await this.wallet.signTransaction(tx);
    const signature = await this.connection.sendRawTransaction(
      signed.serialize()
    );

    await this.confirm(signature);
  }
}

export const useLearningProgressService = () => {
  const wallet = useWallet();

  return useMemo(() => {
    if (!wallet.connected || !wallet.publicKey) return null;

    return new LearningProgressService(
      wallet as AnchorWallet,
      connection
    );
  }, [wallet.connected, wallet.publicKey]);
};