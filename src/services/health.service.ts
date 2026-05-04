// src/services/health.service.ts
// T-020 | Spec: FR-03, FR-04, US-22 (Barbarian), US-28 (Monk), US-82.2

import { getModifier } from './math.service';

export interface ClassEntry {
  hitDie: number;
  classLevel: number;
  isPrimary: boolean;
}

export interface TraitEffects {
  hpBonusPerLevel?: number;   // e.g. Hill Dwarf (+1), Draconic Resilience (+1), Tough feat (+2)
}

/**
 * FR-03 + FR-04 + US-82.2: Calculate maximum HP for a character.
 * - Primary class level 1: max hit die + CON modifier.
 * - Each additional level (same or multiclass): floor(hit_die/2) + 1 + CON modifier, min 1.
 * - Trait bonuses applied after base calculation.
 * - Returns computed value — NEVER stored statically in DB.
 */
export function calculateMaxHP(
  classes: ClassEntry[],
  conScore: number,
  traitEffects: TraitEffects[] = [],
): number {
  const conMod = getModifier(conScore);
  const totalLevel = classes.reduce((sum, c) => sum + c.classLevel, 0);

  // Sort: primary class first (for level-1 max die rule)
  const sorted = [...classes].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

  let hp = 0;
  let levelsProcessed = 0;

  for (const cls of sorted) {
    for (let lvl = 1; lvl <= cls.classLevel; lvl++) {
      if (levelsProcessed === 0 && cls.isPrimary) {
        // FR-03: Level 1 of primary class — use maximum hit die value
        hp += cls.hitDie + conMod;
      } else {
        // FR-04: All other levels — fixed average (floor(die/2)+1), minimum 1 per level
        hp += Math.max(1, Math.floor(cls.hitDie / 2) + 1 + conMod);
      }
      levelsProcessed++;
    }
  }

  // Apply trait HP bonuses (Hill Dwarf, Draconic Resilience, Tough feat)
  for (const effect of traitEffects) {
    if (effect.hpBonusPerLevel) {
      hp += effect.hpBonusPerLevel * totalLevel;
    }
  }

  return Math.max(1, hp);
}

/**
 * US-81.3: Apply exhaustion level 4 — halve the effective max HP.
 */
export function applyExhaustionToMaxHP(maxHp: number, exhaustionLevel: number): number {
  if (exhaustionLevel >= 4) {
    return Math.floor(maxHp / 2);
  }
  return maxHp;
}
