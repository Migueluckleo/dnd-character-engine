// src/services/condition.service.ts
// T-026 | Spec: US-80 (AC 80.1–80.3), US-81 (AC 81.1–81.5)

import type { ConditionId } from '../types/index';
import { CONDITION_IDS } from '../types/index';

export interface ActiveStateRecord {
  exhaustionLevel: number;
  reactionAvailable: boolean;
  isBlinded: boolean;
  isCharmed: boolean;
  isDeafened: boolean;
  isFrightened: boolean;
  isGrappled: boolean;
  isIncapacitated: boolean;
  isInvisible: boolean;
  isParalyzed: boolean;
  isPetrified: boolean;
  isPoisoned: boolean;
  isProne: boolean;
  isRestrained: boolean;
  isStunned: boolean;
  isUnconscious: boolean;
}

/** Derived roll modifiers based on active conditions */
export interface ConditionModifiers {
  attackRollAdvantage: boolean;
  attackRollDisadvantage: boolean;
  strSaveAutoFail: boolean;
  dexSaveAutoFail: boolean;
  abilityCheckDisadvantage: boolean;
  savingThrowDisadvantage: boolean;
  speedMultiplier: number;    // 0 = 0, 0.5 = halved, 1 = normal
  maxHpMultiplier: number;    // 0.5 if exhaustion >= 4
  isCriticalHitVulnerable: boolean; // hits within 5ft auto-crit (paralyzed, unconscious)
  isAttackedWithAdvantage: boolean;
  characterDead: boolean;
}

/**
 * US-80: Apply a condition to the ActiveState.
 * Paralyzed also sets incapacitated (AC 80.1).
 * Petrified also sets incapacitated.
 * Stunned also sets incapacitated.
 * Returns new state — does NOT mutate.
 */
export function applyCondition(
  state: ActiveStateRecord,
  condition: ConditionId,
): ActiveStateRecord {
  const next = { ...state };
  const key = `is${condition.charAt(0).toUpperCase()}${condition.slice(1)}` as keyof ActiveStateRecord;

  if (key in next) {
    (next as Record<string, unknown>)[key] = true;
  }

  // Compound conditions (AC 80.1)
  if (condition === 'paralyzed' || condition === 'petrified' || condition === 'stunned') {
    next.isIncapacitated = true;
  }
  if (condition === 'unconscious') {
    next.isIncapacitated = true;
    next.isProne = true;
  }

  return next;
}

export function removeCondition(
  state: ActiveStateRecord,
  condition: ConditionId,
): ActiveStateRecord {
  const next = { ...state };
  const key = `is${condition.charAt(0).toUpperCase()}${condition.slice(1)}` as keyof ActiveStateRecord;
  if (key in next) {
    (next as Record<string, unknown>)[key] = false;
  }
  return next;
}

/**
 * US-81: Increment exhaustion level (max 6).
 * Level 6 triggers death.
 */
export function incrementExhaustion(
  state: ActiveStateRecord,
): { newState: ActiveStateRecord; characterDied: boolean } {
  const newLevel = Math.min(6, state.exhaustionLevel + 1);
  const newState = { ...state, exhaustionLevel: newLevel };
  return { newState, characterDied: newLevel === 6 };
}

export function decrementExhaustion(
  state: ActiveStateRecord,
): ActiveStateRecord {
  if (state.exhaustionLevel === 0) {
    throw new Error('Exhaustion level is already 0 — cannot decrement further.');
  }
  return { ...state, exhaustionLevel: state.exhaustionLevel - 1 };
}

/**
 * US-80 + US-81: Compute all derived roll modifiers from the current condition state.
 * Used by the hydration engine to flag rolls.
 */
export function getConditionModifiers(state: ActiveStateRecord): ConditionModifiers {
  const ex = state.exhaustionLevel;

  return {
    // Attack modifiers
    attackRollDisadvantage:
      state.isBlinded || state.isFrightened || state.isPoisoned ||
      state.isRestrained || ex >= 3,
    attackRollAdvantage: state.isInvisible,

    // Auto-fail saves
    strSaveAutoFail: state.isParalyzed || state.isPetrified || state.isUnconscious,
    dexSaveAutoFail: state.isParalyzed || state.isPetrified || state.isUnconscious || state.isRestrained,

    // Check/save disadvantage
    abilityCheckDisadvantage: ex >= 1,
    savingThrowDisadvantage:  ex >= 3,

    // Speed
    speedMultiplier: ex >= 5 ? 0 : ex >= 2 ? 0.5 : 1,

    // Max HP (handled in HealthService, flagged here)
    maxHpMultiplier: ex >= 4 ? 0.5 : 1,

    // Critical hit vulnerability (paralyzed or unconscious, within 5ft)
    isCriticalHitVulnerable: state.isParalyzed || state.isUnconscious,

    // Being attacked with advantage
    isAttackedWithAdvantage:
      state.isBlinded || state.isParalyzed || state.isPetrified ||
      state.isRestrained || state.isUnconscious || state.isProne,

    characterDead: ex >= 6,
  };
}

export function validateConditionId(id: string): id is ConditionId {
  return (CONDITION_IDS as readonly string[]).includes(id);
}
