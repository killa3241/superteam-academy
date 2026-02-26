export function deriveLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100))
}