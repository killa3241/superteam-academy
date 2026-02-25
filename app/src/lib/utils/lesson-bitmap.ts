import { BN } from "@coral-xyz/anchor";

export class LessonBitmap {
  static isLessonComplete(lessonFlags: BN[], lessonIndex: number): boolean {
    if (lessonIndex < 0 || lessonIndex >= 256) return false;

    const wordIndex = Math.floor(lessonIndex / 64);
    const bitIndex = lessonIndex % 64;

    if (wordIndex >= lessonFlags.length) return false;

    const word = lessonFlags[wordIndex];
    if (!word) return false;

    const mask = new BN(1).shln(bitIndex);
    return word.and(mask).eq(mask);
  }

  static countCompletedLessons(lessonFlags: BN[]): number {
    return lessonFlags.reduce((sum, word) => {
      if (!word) return sum;

      let count = 0;
      let w = word.clone();

      while (!w.isZero()) {
        if (w.and(new BN(1)).eq(new BN(1))) count++;
        w = w.shrn(1);
      }

      return sum + count;
    }, 0);
  }

  static calculateProgress(lessonFlags: BN[], totalLessons: number): number {
    if (totalLessons <= 0) return 0;

    const completed = this.countCompletedLessons(lessonFlags);
    return (completed / totalLessons) * 100;
  }
}