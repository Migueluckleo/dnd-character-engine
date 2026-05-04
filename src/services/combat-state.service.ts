// src/services/combat-state.service.ts
// T-025 | Spec: US-70 (AC 70.1–70.8), US-72 (AC 72.1–72.3), US-73 (AC 73.1–73.4)

export interface DeathSaveState {
  successes: number;
  failures: number;
  isDead: boolean;
  isStable: boolean;
  regainedHP: number | null; // set to 1 on nat-20
}

export interface HPState {
  currentHp: number;
  tempHp: number;
  isDead: boolean;
  deathSaveTriggered: boolean;
  concentrationSaveDC: number | null;
}

/**
 * US-70: Process a Death Saving Throw roll (1–20).
 * Returns new state — does NOT mutate input.
 */
export function processDeathSave(
  currentSuccesses: number,
  currentFailures: number,
  roll: number,
): DeathSaveState {
  let successes = currentSuccesses;
  let failures = currentFailures;
  let isDead = false;
  let isStable = false;
  let regainedHP: number | null = null;

  if (roll === 20) {
    // AC 70.5: natural 20 — regain 1 HP, reset counters
    return { successes: 0, failures: 0, isDead: false, isStable: false, regainedHP: 1 };
  } else if (roll === 1) {
    // AC 70.6: natural 1 — counts as 2 failures
    failures = Math.min(3, failures + 2);
  } else if (roll >= 10) {
    successes = Math.min(3, successes + 1);
  } else {
    failures = Math.min(3, failures + 1);
  }

  if (failures >= 3) isDead = true;        // AC 70.4
  if (successes >= 3) isStable = true;     // AC 70.3

  return { successes, failures, isDead, isStable, regainedHP };
}

/**
 * US-73 + US-72: Apply incoming damage to a character.
 * Resolves temp HP buffer first, then current HP.
 * Checks for Instant Death (US-72).
 * Returns new HP state — does NOT mutate.
 */
export function applyDamage(params: {
  currentHp: number;
  tempHp: number;
  maxHp: number;
  damage: number;
  isCriticalForDeathSave?: boolean; // AC 70.8: crit at 0 HP = 2 failures
  isConcentrating: boolean;
}): HPState {
  const { currentHp, tempHp, maxHp, damage, isConcentrating } = params;

  // AC 73.1: drain temp HP first
  const tempAbsorbed = Math.min(tempHp, damage);
  const remainingDamage = damage - tempAbsorbed;
  const newTempHp = tempHp - tempAbsorbed;
  let newCurrentHp = Math.max(0, currentHp - remainingDamage);

  // US-72 AC 72.3: Instant Death check
  const isDead = remainingDamage >= currentHp + maxHp;

  // AC 78.3: concentration save DC = max(10, floor(damage/2))
  const concentrationSaveDC = isConcentrating
    ? Math.max(10, Math.floor(damage / 2))
    : null;

  const deathSaveTriggered = !isDead && newCurrentHp === 0 && newTempHp === 0;

  return {
    currentHp: newCurrentHp,
    tempHp: newTempHp,
    isDead,
    deathSaveTriggered,
    concentrationSaveDC,
  };
}

/**
 * US-73.2: Set Temporary HP — no stacking.
 * Only replaces if new value is strictly higher.
 */
export function setTempHP(currentTempHp: number, newAmount: number): number {
  return newAmount > currentTempHp ? newAmount : currentTempHp;
}

/**
 * US-70.7: Reset death save counters when HP is restored above 0.
 */
export function resetDeathSaves(): Pick<DeathSaveState, 'successes' | 'failures'> {
  return { successes: 0, failures: 0 };
}
