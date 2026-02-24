import { Program, AnchorProvider, BN, IdlTypes, IdlAccounts, utils } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Connection, clusterApiUrl, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { 
  getAssociatedTokenAddressSync, 
  createAssociatedTokenAccountInstruction,
  TOKEN_2022_PROGRAM_ID
} from "@solana/spl-token";
import { useWallet, AnchorWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import idlRaw from "@/lib/idl/onchain_academy.json";

// Program constants - moved to top to avoid circular reference
const PROGRAM_ID = new PublicKey("ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf");
const MPL_CORE_PROGRAM_ID = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");

// IDL must match on-chain casing exactly (lowercase account names like "course", "enrollment")
const accountDiscriminator = (name: string): number[] => {
  const hashHex = utils.sha256.hash(`account:${name}`);
  const hashBytes = utils.bytes.hex.decode(hashHex);
  return Array.from(hashBytes.slice(0, 8));
};

const idl = {
  ...idlRaw,
  address: PROGRAM_ID.toString(),
  metadata: { address: PROGRAM_ID.toString() },
  accounts: (idlRaw as any).accounts
    ? (idlRaw as any).accounts.map((acc: any) => ({
        ...acc,
        name: String(acc.name).toLowerCase(),
        discriminator: acc.discriminator ?? accountDiscriminator(String(acc.name).toLowerCase()),
      }))
    : undefined,
} as any;

// Type definitions based on IDL
type Course = any;
type Enrollment = any;
type Config = any;

// User progress data interface
export interface UserProgressData {
  course: Course;
  enrollment: Enrollment;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  isCompleted: boolean;
}

// XP and Level calculation utilities
export class XPCalculator {
  /**
   * Calculate level from XP using formula: Level = floor(sqrt(XP / 100))
   */
  static calculateLevel(xpBalance: BN): number {
    if (xpBalance.lt(new BN(100))) return 0;
    
    // Convert to number for calculation (XP is typically within safe range)
    const xp = xpBalance.toNumber();
    return Math.floor(Math.sqrt(xp / 100));
  }

  /**
   * Calculate XP required for a given level
   */
  static xpForLevel(level: number): BN {
    return new BN(level * level * 100);
  }

  /**
   * Calculate XP progress towards next level (0-100)
   */
  static levelProgress(xpBalance: BN): number {
    const currentLevel = this.calculateLevel(xpBalance);
    const currentLevelXp = this.xpForLevel(currentLevel);
    const nextLevelXp = this.xpForLevel(currentLevel + 1);
    
    if (currentLevelXp.eq(nextLevelXp)) return 100;
    
    const xp = xpBalance.toNumber();
    const currentXp = currentLevelXp.toNumber();
    const nextXp = nextLevelXp.toNumber();
    
    return ((xp - currentXp) / (nextXp - currentXp)) * 100;
  }
}

// Lesson bitmap utilities for 256-bit progress tracking
export class LessonBitmap {
  /**
   * Check if a lesson is completed in bitmap
   */
  static isLessonComplete(lessonFlags: BN[], lessonIndex: number): boolean {
    if (lessonIndex < 0 || lessonIndex >= 256) return false;
    
    const wordIndex = Math.floor(lessonIndex / 64);
    const bitIndex = lessonIndex % 64;
    
    if (wordIndex >= lessonFlags.length) return false;
    
    const word = lessonFlags[wordIndex];
    if (!word) return false;
    
    // Create mask for specific bit and check if it's set
    const mask = new BN(1).shln(bitIndex);
    return word.and(mask).eq(mask);
  }

  /**
   * Count completed lessons from bitmap
   */
  static countCompletedLessons(lessonFlags: BN[]): number {
    return lessonFlags.reduce((sum, word) => {
      if (!word) return sum;
      
      let count = 0;
      let w = word.clone();
      
      // Count set bits in 64-bit number
      while (!w.isZero()) {
        // Check if least significant bit is set
        if (w.and(new BN(1)).eq(new BN(1))) {
          count++;
        }
        // Right shift by 1
        w = w.shrn(1);
      }
      
      return sum + count;
    }, 0);
  }

  /**
   * Get array of completed lesson indices
   */
  static getCompletedLessonIndices(lessonFlags: BN[], lessonCount: number): number[] {
    const completed: number[] = [];
    for (let i = 0; i < lessonCount; i++) {
      if (LessonBitmap.isLessonComplete(lessonFlags, i)) {
        completed.push(i);
      }
    }
    return completed;
  }

  /**
   * Calculate progress percentage (0-100)
   */
  static calculateProgress(lessonFlags: BN[], totalLessons: number): number {
    if (totalLessons <= 0) return 0;
    
    const completed = LessonBitmap.countCompletedLessons(lessonFlags);
    return (completed / totalLessons) * 100;
  }
}

// PDA Derivation utilities
export class PDADerivation {
  /**
   * Derive Config PDA
   */
  static getConfigPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      PROGRAM_ID
    );
  }

  /**
   * Derive Course PDA
   */
  static getCoursePDA(courseId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("course"), Buffer.from(courseId)],
      PROGRAM_ID
    );
  }

  /**
   * Derive Enrollment PDA
   */
  static getEnrollmentPDA(courseId: string, learner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("enrollment"), Buffer.from(courseId), learner.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Derive MinterRole PDA
   */
  static getMinterRolePDA(minter: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("minter"), minter.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Get XP Token Account address for a user
   */
  static getXPTokenAddress(user: PublicKey, xpMint: PublicKey): PublicKey {
    return getAssociatedTokenAddressSync(
      xpMint,
      user,
      false,
      TOKEN_2022_PROGRAM_ID
    );
  }
}

// Main service class for interacting with on-chain program
export class LearningProgressService {
  private program: Program<any>;
  private connection: Connection;
  private wallet: AnchorWallet;

  constructor(wallet: AnchorWallet) {
    console.log("Initializing LearningProgressService with wallet:", wallet);
    this.wallet = wallet;
    this.connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    // Critical validation - ensure IDL has accounts
    if (!idlRaw.accounts || idlRaw.accounts.length === 0) {
      throw new Error('CRITICAL: IDL file is missing accounts array');
    }

    console.log("Creating provider...");
    const provider = new AnchorProvider(this.connection, wallet as any, AnchorProvider.defaultOptions());

    // Validation log - verify IDL structure
    console.log("IDL validation - address:", idl.address);
    console.log("IDL validation - accounts:", idl.accounts);
    console.log("Creating program with IDL:", idl);
    console.log("Provider:", provider);

    // Two-argument constructor: new Program(idl, provider)
    this.program = new Program(idl, provider);
    console.log("Program created:", this.program);
  }

  /**
   * Get all active courses
   */
  async getAllCourses(): Promise<Course[]> {
    try {
      if (!this.program) {
        console.error("Program is not initialized");
        return [];
      }
      
      console.log("Fetching courses from program...");
      const courses = await (this.program.account as any).course.all();
      console.log("Raw courses data:", courses);
      
      // Log the structure of first course to debug
      if (courses.length > 0) {
        console.log("First course structure:", Object.keys(courses[0]));
        console.log("First course account:", courses[0].account);
      }
      
      // Filter and map with better error handling
      return courses
        .filter((course: any) => {
          // Check if course has account property and if it's active
          if (!course.account) {
            console.warn("Course missing account property:", course);
            return false;
          }
          return course.account.isActive !== false;
        })
        .map((course: any) => course.account);
    } catch (error) {
      console.error("Error fetching courses:", error);
      // Return empty array on any error to prevent crashes
      return [];
    }
  }

  /**
   * Get course by ID
   */
  async getCourse(courseId: string): Promise<Course | null> {
    try {
      const [coursePDA] = PDADerivation.getCoursePDA(courseId);
      const course = await (this.program.account as any).course.fetch(coursePDA);
      return course;
    } catch (error) {
      console.error("Error fetching course:", error);
      return null;
    }
  }

  /**
   * Get user's enrollment for a course
   */
  async getEnrollment(courseId: string): Promise<Enrollment | null> {
    try {
      const [enrollmentPDA] = PDADerivation.getEnrollmentPDA(courseId, this.wallet.publicKey);
      const enrollment = await (this.program.account as any).enrollment.fetchNullable(enrollmentPDA);
      return enrollment;
    } catch (error) {
      console.error("Error fetching enrollment:", error);
      return null;
    }
  }

  /**
   * Enroll in a course
   */
  async enrollInCourse(courseId: string): Promise<string> {
    try {
      if (!this.wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      const [coursePDA] = PDADerivation.getCoursePDA(courseId);
      const [enrollmentPDA] = PDADerivation.getEnrollmentPDA(courseId, this.wallet.publicKey);

      const transaction = await (this.program as any).methods
        .enroll(courseId)
        .accounts({
          course: coursePDA,
          enrollment: enrollmentPDA,
          learner: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const signedTransaction = await this.wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      await this.connection.confirmTransaction(signature, "confirmed");
      
      return signature;
    } catch (error) {
      console.error("Error enrolling in course:", error);
      throw error;
    }
  }

  /**
   * Complete a lesson
   */
  async completeLesson(courseId: string, lessonIndex: number): Promise<string> {
    try {
      if (!this.wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      const [coursePDA] = PDADerivation.getCoursePDA(courseId);
      const [enrollmentPDA] = PDADerivation.getEnrollmentPDA(courseId, this.wallet.publicKey);
      const [configPDA] = PDADerivation.getConfigPDA();
      const [minterRolePDA] = PDADerivation.getMinterRolePDA(this.wallet.publicKey);
      
      const config = await (this.program.account as any).config.fetch(configPDA);
      const userXpAccount = PDADerivation.getXPTokenAddress(this.wallet.publicKey, config.xpMint);

      const transaction = await (this.program as any).methods
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

      const signedTransaction = await this.wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      await this.connection.confirmTransaction(signature, "confirmed");
      
      return signature;
    } catch (error) {
      console.error("Error completing lesson:", error);
      throw error;
    }
  }

  /**
   * Get user's XP balance
   */
  async getUserXPBalance(): Promise<BN> {
    try {
      const [configPDA] = PDADerivation.getConfigPDA();
      const config = await (this.program.account as any).config.fetch(configPDA);
      
      const userXpAccount = PDADerivation.getXPTokenAddress(this.wallet.publicKey, config.xpMint);
      
      try {
        const balance = await this.connection.getTokenAccountBalance(userXpAccount);
        return new BN(balance.value.amount);
      } catch {
        // Account doesn't exist yet
        return new BN(0);
      }
    } catch (error) {
      console.error("Error fetching XP balance:", error);
      return new BN(0);
    }
  }

  /**
   * Get user's level based on XP
   */
  async getUserLevel(): Promise<number> {
    const xpBalance = await this.getUserXPBalance();
    return XPCalculator.calculateLevel(xpBalance);
  }

  /**
   * Get user's progress for all enrolled courses
   */
  async getUserProgress(): Promise<UserProgressData[]> {
    try {
      const allCourses = await this.getAllCourses();
      const progressData: UserProgressData[] = [];
      
      for (const course of allCourses) {
        const enrollment = await this.getEnrollment(course.courseId);
        
        if (enrollment) {
          const completedLessons = LessonBitmap.countCompletedLessons(enrollment.lessonFlags);
          const progress = LessonBitmap.calculateProgress(enrollment.lessonFlags, course.lessonCount);
          const isCompleted = enrollment.completedAt !== null && enrollment.completedAt !== undefined;

          progressData.push({
            course,
            enrollment,
            progress,
            completedLessons,
            totalLessons: course.lessonCount,
            isCompleted
          });
        }
      }

      return progressData;
    } catch (error) {
      console.error("Error fetching user progress:", error);
      return [];
    }
  }

  /**
   * Create XP token account if it doesn't exist
   */
  async ensureXPTokenAccount(): Promise<void> {
    try {
      const [configPDA] = PDADerivation.getConfigPDA();
      const config = await (this.program.account as any).config.fetch(configPDA);
      
      const userXpAccount = PDADerivation.getXPTokenAddress(this.wallet.publicKey, config.xpMint);
      
      // Check if account exists
      const accountInfo = await this.connection.getAccountInfo(userXpAccount);
      if (accountInfo) return;

      // Create account if it doesn't exist
      const createATAInstruction = createAssociatedTokenAccountInstruction(
        this.wallet.publicKey,
        config.xpMint,
        this.wallet.publicKey,
        userXpAccount,
        TOKEN_2022_PROGRAM_ID
      );

      const transaction = new Transaction().add(createATAInstruction);
      const signedTransaction = await this.wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      await this.connection.confirmTransaction(signature, "confirmed");
    } catch (error) {
      console.error("Error creating XP token account:", error);
      throw error;
    }
  }
}

// Hook for using the service in React components
export const useLearningProgressService = () => {
  const wallet = useWallet() as any;
  
  return useMemo(() => {
    if (!wallet.connected || !wallet.publicKey) {
      return null;
    }

    // Cast wallet to AnchorWallet to satisfy TypeScript
    try {
      return new LearningProgressService(wallet as AnchorWallet);
    } catch (e) {
      console.error("Failed to initialize LearningProgressService:", e);
      return null;
    }
  }, [wallet.connected, wallet.publicKey]);
};
