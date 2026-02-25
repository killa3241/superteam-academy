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
    try {
      const accounts = await (this.program.account as any).course.all();

      return accounts
        .filter((c: any) => c.account?.isActive !== false)
        .map((c: any) => c.account);
    } catch (error) {
      console.error("Error fetching courses:", error);
      return [];
    }
  }

  async getCourse(courseId: string): Promise<Course | null> {
    try {
      const [coursePDA] = PDADerivation.getCoursePDA(courseId);
      return await (this.program.account as any).course.fetch(coursePDA);
    } catch (error) {
      console.error("Error fetching course:", error);
      return null;
    }
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
    const [coursePDA] = PDADerivation.getCoursePDA(courseId);
    const [enrollmentPDA] = PDADerivation.getEnrollmentPDA(
      courseId,
      this.wallet.publicKey
    );
    const [configPDA] = PDADerivation.getConfigPDA();
    const [minterRolePDA] = PDADerivation.getMinterRolePDA(
      this.wallet.publicKey
    );

    const config = await (this.program.account as any).config.fetch(configPDA);

    const userXpAccount = PDADerivation.getXPTokenAddress(
      this.wallet.publicKey,
      config.xpMint
    );

    const tx = await (this.program as any).methods
      .completeLesson(courseId, lessonIndex)
      .accounts({
        course: coursePDA,
        enrollment: enrollmentPDA,
        learner: this.wallet.publicKey,
        minterRole: minterRolePDA,
        xpMint: config.xpMint,
        learnerXpAccount: userXpAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .transaction();

    const signed = await this.wallet.signTransaction(tx);
    const signature = await this.connection.sendRawTransaction(
      signed.serialize()
    );
    await this.confirm(signature);

    return signature;
  }

  /* ----------------------------- XP -------------------------------------- */

  async getUserXPBalance(): Promise<BN> {
    try {
      const [configPDA] = PDADerivation.getConfigPDA();
      const config = await (this.program.account as any).config.fetch(configPDA);

      const userXpAccount = PDADerivation.getXPTokenAddress(
        this.wallet.publicKey,
        config.xpMint
      );

      const balance = await this.connection.getTokenAccountBalance(
        userXpAccount
      );

      return new BN(balance.value.amount);
    } catch {
      return new BN(0);
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
      const enrollment = await this.getEnrollment(course.courseId);
      if (!enrollment) continue;

      const completedLessons = LessonBitmap.countCompletedLessons(
        enrollment.lessonFlags
      );

      const progress = LessonBitmap.calculateProgress(
        enrollment.lessonFlags,
        course.lessonCount
      );

      results.push({
        course,
        enrollment,
        progress,
        completedLessons,
        totalLessons: course.lessonCount,
        isCompleted: !!enrollment.completedAt,
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