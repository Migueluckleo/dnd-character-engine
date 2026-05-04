// src/services/initiative.service.ts
// T-032 | Spec: FR-13, US-87 (AC 87.1–87.5)

import { getModifier, getHalfProficiencyBonus } from './math.service';

export interface InitiativeResult {
  initiativeBonus: number;
  breakdown: string[];
}

/**
 * FR-13 + US-87: Calculate initiative bonus.
 * Base = DEX modifier.
 * Bard Jack of All Trades adds floor(profBonus/2) from level 2.
 * Alert feat adds +5.
 */
export function getInitiativeBonus(params: {
  dexScore: number;
  totalLevel: number;
  hasJackOfAllTrades: boolean;
  hasAlertFeat: boolean;
}): InitiativeResult {
  const dexMod = getModifier(params.dexScore);
  const breakdown: string[] = [`DEX modifier: ${dexMod}`];
  let bonus = dexMod;

  if (params.hasJackOfAllTrades) {
    const halfProf = getHalfProficiencyBonus(params.totalLevel);
    bonus += halfProf;
    breakdown.push(`Jack of All Trades: +${halfProf}`);
  }

  if (params.hasAlertFeat) {
    bonus += 5;
    breakdown.push(`Alert feat: +5`);
  }

  return { initiativeBonus: bonus, breakdown };
}
