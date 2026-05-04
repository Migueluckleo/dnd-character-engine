// src/services/ac.service.ts
// T-021 | Spec: FR-02, US-67 (AC 67.1–67.4), US-22 (Barbarian), US-28 (Monk)

import { getModifier } from './math.service';

export type ArmorCategory = 'light' | 'medium' | 'heavy' | 'shield' | null;

export interface EquippedArmor {
  armorCategory: ArmorCategory;
  acBase: number;
  strengthRequirement?: number;
}

export interface UnArmoredOverride {
  type: 'barbarian' | 'monk' | 'none';
}

/**
 * FR-02 + US-67: Calculate Armor Class.
 * - Checks equipped armor category.
 * - Applies DEX modifier cap by category.
 * - Handles Barbarian/Monk unarmored overrides.
 * - Adds shield bonus if equipped.
 * Pure function — returns computed AC, does NOT mutate.
 */
export function calculateAC(params: {
  dexScore: number;
  conScore: number;
  wisScore: number;
  equippedArmor: EquippedArmor | null;
  shieldEquipped: boolean;
  unArmoredOverride: UnArmoredOverride;
}): number {
  const { dexScore, conScore, wisScore, equippedArmor, shieldEquipped, unArmoredOverride } = params;
  const dexMod = getModifier(dexScore);
  const conMod = getModifier(conScore);
  const wisMod = getModifier(wisScore);

  let ac: number;

  if (!equippedArmor || equippedArmor.armorCategory === null || equippedArmor.armorCategory === 'shield') {
    // Unarmored — apply class override if applicable
    if (unArmoredOverride.type === 'barbarian') {
      // US-22: 10 + DEX mod + CON mod
      ac = 10 + dexMod + conMod;
    } else if (unArmoredOverride.type === 'monk') {
      // US-28: 10 + DEX mod + WIS mod
      ac = 10 + dexMod + wisMod;
    } else {
      // FR-02: Standard unarmored
      ac = 10 + dexMod;
    }
  } else {
    const cat = equippedArmor.armorCategory;
    if (cat === 'light') {
      // AC 67.2: full DEX modifier
      ac = equippedArmor.acBase + dexMod;
    } else if (cat === 'medium') {
      // AC 67.2: DEX modifier capped at +2
      ac = equippedArmor.acBase + Math.min(dexMod, 2);
    } else {
      // 'heavy': AC 67.2 — ignores DEX entirely
      ac = equippedArmor.acBase;
    }
  }

  // AC 67.2: Shield adds flat +2
  if (shieldEquipped) {
    ac += 2;
  }

  return ac;
}
