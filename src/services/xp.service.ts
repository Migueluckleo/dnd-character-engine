// src/services/xp.service.ts
// T-033 | Spec: FR-09, US-88 (AC 88.1–88.5)

/** US-88.1 + FR-09 — Full XP threshold table (levels 1–20) */
export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,      2: 300,    3: 900,    4: 2700,   5: 6500,
  6: 14000,  7: 23000,  8: 34000,  9: 48000,  10: 64000,
  11: 85000, 12: 100000,13: 120000,14: 140000, 15: 165000,
  16: 195000,17: 225000,18: 265000,19: 305000, 20: 355000,
};

/**
 * US-88.2: Get total level from accumulated XP.
 * XP only ever increments — never decrements.
 */
export function getLevelFromXP(xp: number): number {
  let level = 1;
  for (const [lvl, threshold] of Object.entries(XP_THRESHOLDS)) {
    if (xp >= threshold) level = Number(lvl);
  }
  return level;
}

/**
 * US-88.3: Check if a level-up is available given current XP and current level.
 */
export function isLevelUpAvailable(currentXP: number, currentTotalLevel: number): boolean {
  const nextLevelThreshold = XP_THRESHOLDS[currentTotalLevel + 1];
  if (!nextLevelThreshold) return false; // already level 20
  return currentXP >= nextLevelThreshold;
}

/**
 * US-88.2: Add XP — returns new total (never below current).
 */
export function addXP(currentXP: number, amount: number): number {
  if (amount < 0) throw new Error('XP cannot be decremented (AC 88.2).');
  return currentXP + amount;
}

/** US-111.3: Get the minimum XP threshold for a given level (1–20). */
export function getXPForLevel(level: number): number {
  return XP_THRESHOLDS[Math.max(1, Math.min(20, level))] ?? 0;
}

/** Get XP needed to reach the next level. */
export function xpToNextLevel(currentXP: number): number | null {
  const currentLevel = getLevelFromXP(currentXP);
  const nextThreshold = XP_THRESHOLDS[currentLevel + 1];
  if (!nextThreshold) return null; // max level
  return nextThreshold - currentXP;
}
