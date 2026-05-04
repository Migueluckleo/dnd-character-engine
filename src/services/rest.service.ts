// src/services/rest.service.ts
// T-029 | Spec: FR-10, FR-11, US-71 (AC 71.1–71.5), US-86 (AC 86.1–86.6)

import { getModifier } from './math.service';
import { recoverSlotsOnRest, type SpellSlotTrackerRow } from './spell-slot.service';

export interface HitDiceTrackerRow {
  dieType: number;
  maxDice: number;
  expendedDice: number;
}

export interface ResourcePoolRow {
  poolId: string;
  current: number;
  max: number;
  resetOn: 'short_rest' | 'long_rest';
}

export interface ShortRestResult {
  hpRecovered: number;
  newCurrentHp: number;
  hitDiceTrackers: HitDiceTrackerRow[];
  spellSlotTrackers: SpellSlotTrackerRow[];
  resourcePools: ResourcePoolRow[];
}

export interface LongRestResult {
  newCurrentHp: number;
  hitDiceTrackers: HitDiceTrackerRow[];
  spellSlotTrackers: SpellSlotTrackerRow[];
  resourcePools: ResourcePoolRow[];
  exhaustionLevel: number;
}

/**
 * FR-10 + US-71: Trigger a Short Rest.
 * Spends the requested Hit Dice, recovering HP.
 * Resets Short Rest class resources.
 */
export function triggerShortRest(params: {
  currentHp: number;
  maxHp: number;
  conScore: number;
  hitDiceTrackers: HitDiceTrackerRow[];
  hitDiceToSpend: number;                // number of dice to spend (die type inferred from primary class)
  primaryDieType: number;
  spellSlotTrackers: SpellSlotTrackerRow[];
  resourcePools: ResourcePoolRow[];
  songOfRestDie?: number;               // US-71.5: Bard feature (d6 at level 2–8, etc.)
}): ShortRestResult {
  const { currentHp, maxHp, conScore, hitDiceToSpend, primaryDieType, songOfRestDie } = params;
  const conMod = getModifier(conScore);

  // Find the tracker for the primary die type
  const tracker = params.hitDiceTrackers.find(t => t.dieType === primaryDieType);
  if (!tracker) throw new Error(`No Hit Dice tracker found for d${primaryDieType}.`);

  const available = tracker.maxDice - tracker.expendedDice;
  if (hitDiceToSpend > available) {
    throw new Error(
      `Cannot spend ${hitDiceToSpend} Hit Dice — only ${available} available (AC 71.3).`
    );
  }

  // Note: actual die roll is client-side (or random here for API use).
  // We model the maximum recoverable per die for deterministic calculations.
  // In the API, the client sends rolled values; this service validates and caps.
  // For the engine, we compute the expected average as a baseline.
  const hpPerDie = Math.max(1, Math.floor(primaryDieType / 2) + 1 + conMod);
  let hpRecovered = hitDiceToSpend * hpPerDie;

  // US-71.5: Song of Rest adds bonus HP once per short rest
  if (songOfRestDie) {
    hpRecovered += Math.floor(songOfRestDie / 2) + 1; // expected average of the bonus die
  }

  const newCurrentHp = Math.min(maxHp, currentHp + hpRecovered);

  // Update Hit Dice tracker
  const newTrackers = params.hitDiceTrackers.map(t =>
    t.dieType === primaryDieType
      ? { ...t, expendedDice: t.expendedDice + hitDiceToSpend }
      : t
  );

  // Recover Short Rest spell slots (Warlock pact magic)
  const newSlots = recoverSlotsOnRest(params.spellSlotTrackers, 'short_rest');

  // Reset Short Rest resource pools
  const newPools = params.resourcePools.map(p =>
    p.resetOn === 'short_rest' ? { ...p, current: p.max } : p
  );

  return {
    hpRecovered: newCurrentHp - currentHp,
    newCurrentHp,
    hitDiceTrackers: newTrackers,
    spellSlotTrackers: newSlots,
    resourcePools: newPools,
  };
}

/**
 * FR-11 + US-86: Trigger a Long Rest.
 * Fully restores HP, recovers half Hit Dice (min 1), resets all Long Rest resources.
 */
export function triggerLongRest(params: {
  maxHp: number;
  totalLevel: number;
  exhaustionLevel: number;
  hitDiceTrackers: HitDiceTrackerRow[];
  spellSlotTrackers: SpellSlotTrackerRow[];
  resourcePools: ResourcePoolRow[];
}): LongRestResult {
  // AC 86.2: Restore all HP
  const newCurrentHp = params.maxHp;

  // AC 86.3: Recover floor(totalLevel/2) Hit Dice, minimum 1
  const diceToRecover = Math.max(1, Math.floor(params.totalLevel / 2));
  const newTrackers = params.hitDiceTrackers.map(t => ({
    ...t,
    expendedDice: Math.max(0, t.expendedDice - diceToRecover),
  }));

  // AC 86.4: Reset all standard spell slots
  const newSlots = recoverSlotsOnRest(params.spellSlotTrackers, 'long_rest');

  // AC 86.6: Reset Long Rest resource pools
  const newPools = params.resourcePools.map(p =>
    p.resetOn === 'long_rest' ? { ...p, current: p.max } : p
  );

  // AC 86.5: Reduce exhaustion by 1
  const newExhaustion = Math.max(0, params.exhaustionLevel - 1);

  return {
    newCurrentHp,
    hitDiceTrackers: newTrackers,
    spellSlotTrackers: newSlots,
    resourcePools: newPools,
    exhaustionLevel: newExhaustion,
  };
}
