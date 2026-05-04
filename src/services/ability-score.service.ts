// src/services/ability-score.service.ts
// T-019 | Spec: US-01, US-85 (AC 85.1–85.5), FR-06

import type { PointBuyInput, ValidationResult } from '../types/index';

/** US-85.1 — Official Point Buy cost table (non-linear at 14 and 15) */
const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};

/** US-85.2 — Budget */
const POINT_BUY_BUDGET = 27;

/**
 * US-85: Validate a full set of 6 base scores against the Point Buy rules.
 * Returns valid=true only if all ACs in US-85.1–85.3 are satisfied.
 * Pure function — does NOT mutate input.
 */
export function validatePointBuy(scores: PointBuyInput): ValidationResult {
  const errors: string[] = [];
  let totalCost = 0;

  for (const [ability, score] of Object.entries(scores)) {
    // AC 85.3: minimum 8
    if (score < 8) {
      errors.push(`Score for ${ability} is ${score} — minimum is 8 (AC 85.3).`);
      continue;
    }
    // AC 85.4: maximum 15 before racial bonuses
    if (score > 15) {
      errors.push(`Score for ${ability} is ${score} — maximum via Point Buy is 15 (AC 85.4).`);
      continue;
    }
    totalCost += POINT_BUY_COSTS[score] ?? 0;
  }

  // AC 85.2: total budget
  if (totalCost > POINT_BUY_BUDGET) {
    errors.push(`Total Point Buy cost is ${totalCost} — budget is ${POINT_BUY_BUDGET} (AC 85.2).`);
  }

  return { valid: errors.length === 0, errors, pointsUsed: totalCost };
}

/**
 * US-85.5, FR-06: Apply racial bonuses to base scores.
 * Returns new object — does NOT mutate input.
 * Enforces minimum of 1, maximum of 20 (standard cap).
 */
export function applyRacialBonuses(
  base: PointBuyInput,
  bonuses: Partial<PointBuyInput>,
): PointBuyInput {
  return {
    str: Math.min(20, Math.max(1, base.str + (bonuses.str ?? 0))),
    dex: Math.min(20, Math.max(1, base.dex + (bonuses.dex ?? 0))),
    con: Math.min(20, Math.max(1, base.con + (bonuses.con ?? 0))),
    int: Math.min(20, Math.max(1, base.int + (bonuses.int ?? 0))),
    wis: Math.min(20, Math.max(1, base.wis + (bonuses.wis ?? 0))),
    cha: Math.min(20, Math.max(1, base.cha + (bonuses.cha ?? 0))),
  };
}

/** Get the point cost for a single score value (returns undefined if out of range) */
export function getPointCost(score: number): number | undefined {
  return POINT_BUY_COSTS[score];
}
