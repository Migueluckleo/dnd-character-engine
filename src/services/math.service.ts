// src/services/math.service.ts
// T-018 | Spec: FR-01, FR-05, .claude.md §3
// Pure functions — no mutations, no side effects

/**
 * FR-01: Calculate ability modifier from a score.
 * Formula: floor((score - 10) / 2)
 * All divisions MUST use Math.floor (.claude.md §3)
 */
export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * FR-05: Proficiency bonus by total character level.
 * Levels 1–4 → +2 | 5–8 → +3 | 9–12 → +4 | 13–16 → +5 | 17–20 → +6
 */
export function getProficiencyBonus(totalLevel: number): number {
  if (totalLevel < 1) throw new Error(`Invalid level: ${totalLevel}`);
  return Math.floor((totalLevel - 1) / 4) + 2;
}

/**
 * Helper: half proficiency bonus, floor-rounded (used by Jack of All Trades, US-27.4)
 */
export function getHalfProficiencyBonus(totalLevel: number): number {
  return Math.floor(getProficiencyBonus(totalLevel) / 2);
}

/**
 * Clamp a value between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
