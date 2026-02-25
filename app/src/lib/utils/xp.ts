import { BN } from "@coral-xyz/anchor";

export class XPCalculator {
  static calculateLevel(xpBalance: BN): number {
    if (xpBalance.lt(new BN(100))) return 0;

    const xp = xpBalance.toNumber();
    return Math.floor(Math.sqrt(xp / 100));
  }

  static xpForLevel(level: number): BN {
    return new BN(level * level * 100);
  }

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