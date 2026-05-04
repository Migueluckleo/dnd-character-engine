// src/services/combat.service.ts
// T-024 | Spec: FR-08, US-06 (AC 6.1–6.2), US-68 (AC 68.1–68.7), US-75 (AC 75.1–75.3)

import { getModifier } from './math.service';

export interface WeaponProperties {
  finesse?: boolean;
  heavy?: boolean;
  light?: boolean;
  thrown?: boolean;
  versatile?: string;     // e.g. "1d10"
  twoHanded?: boolean;
  rangeNormal?: number;
  rangeLong?: number;
  ammunition?: boolean;
}

export interface AttackBonusResult {
  attackBonus: number;
  damageBonus: number;
  usedAbility: 'str' | 'dex';
  isCritical: boolean;
}

/**
 * US-68.3 + FR-08: Calculate melee/ranged attack bonus.
 * Handles finesse (use higher of STR/DEX).
 */
export function calculateAttackBonus(params: {
  strScore: number;
  dexScore: number;
  proficiencyBonus: number;
  isProficient: boolean;
  weaponProperties: WeaponProperties;
  isCritical?: boolean;
}): AttackBonusResult {
  const { strScore, dexScore, proficiencyBonus, isProficient, weaponProperties } = params;
  const strMod = getModifier(strScore);
  const dexMod = getModifier(dexScore);

  let abilityMod: number;
  let usedAbility: 'str' | 'dex';

  if (weaponProperties.finesse) {
    // AC 68.3: use the higher modifier
    if (dexMod >= strMod) {
      abilityMod = dexMod; usedAbility = 'dex';
    } else {
      abilityMod = strMod; usedAbility = 'str';
    }
  } else if (weaponProperties.rangeNormal || weaponProperties.thrown) {
    abilityMod = dexMod; usedAbility = 'dex';
  } else {
    abilityMod = strMod; usedAbility = 'str';
  }

  const profBonus = isProficient ? proficiencyBonus : 0;
  return {
    attackBonus: abilityMod + profBonus,
    damageBonus: abilityMod,
    usedAbility,
    isCritical: params.isCritical ?? false,
  };
}

/**
 * FR-08 / US-06: Apply critical hit — doubles number of damage dice only.
 * Flat modifiers are NOT doubled.
 * e.g. "1d8" on a crit → roll 2d8, then add flat bonus.
 */
export function getCriticalDiceCount(baseDiceCount: number): number {
  return baseDiceCount * 2;
}

/**
 * US-75: Unarmed strike — base damage = 1 + STR modifier (minimum 1).
 * Attack roll uses proficiency + STR modifier.
 */
export function calculateUnarmedStrike(params: {
  strScore: number;
  proficiencyBonus: number;
  martialArtsDie?: number; // Monk override (US-75.3)
  useDexForMonk?: boolean;
  dexScore?: number;
}): { attackBonus: number; damage: string; damageBonus: number } {
  const strMod = getModifier(params.strScore);

  if (params.martialArtsDie) {
    // US-75.3: Monk — use martial arts die, can use DEX
    const abilityMod = params.useDexForMonk && params.dexScore !== undefined
      ? Math.max(getModifier(params.dexScore), strMod)
      : strMod;
    return {
      attackBonus: params.proficiencyBonus + abilityMod,
      damage: `1d${params.martialArtsDie}`,
      damageBonus: abilityMod,
    };
  }

  // AC 75.1: Standard unarmed — 1 + STR mod, minimum 1
  return {
    attackBonus: params.proficiencyBonus + strMod,
    damage: '1',
    damageBonus: Math.max(1, 1 + strMod) - 1, // flat bonus portion
  };
}

/**
 * US-37 etc.: Spell Save DC formula.
 * DC = 8 + proficiency_bonus + spellcasting_ability_modifier
 */
export function calculateSpellSaveDC(
  spellcastingAbilityScore: number,
  proficiencyBonus: number,
): number {
  return 8 + proficiencyBonus + getModifier(spellcastingAbilityScore);
}

/**
 * Spell attack bonus = proficiency_bonus + spellcasting_ability_modifier
 */
export function calculateSpellAttackBonus(
  spellcastingAbilityScore: number,
  proficiencyBonus: number,
): number {
  return proficiencyBonus + getModifier(spellcastingAbilityScore);
}
