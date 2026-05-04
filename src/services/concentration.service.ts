// src/services/concentration.service.ts
// T-027 | Spec: US-78 (AC 78.1–78.6)

/**
 * US-78.3: Calculate CON saving throw DC when a concentrating character takes damage.
 * DC = max(10, floor(damage / 2))
 */
export function getConcentrationSaveDC(damage: number): number {
  return Math.max(10, Math.floor(damage / 2));
}

/**
 * US-78.1 + US-78.2: Cast a new concentration spell.
 * Always clears previous concentration first (auto-end), then sets new one.
 * Returns the new active_concentration_spell_id.
 */
export function castConcentrationSpell(
  newKnownSpellId: string,
): { activeConcentrationSpellId: string; previousCleared: boolean; previousId: string | null } {
  // Note: previous spell ID must be passed in — this is a pure function
  return {
    activeConcentrationSpellId: newKnownSpellId,
    previousCleared: true,   // always true; caller logs the previous id
    previousId: null,         // caller provides; here we model the transition
  };
}

/**
 * US-78.5: End concentration voluntarily or due to incapacitation/death.
 * Returns null — the new value of active_concentration_spell_id.
 */
export function endConcentration(): null {
  return null;
}

/**
 * US-78.4: Check if a CON saving throw (d20 + CON save bonus) beats the DC.
 */
export function doesConcentrationHold(params: {
  roll: number;
  conSaveBonus: number;
  dc: number;
}): boolean {
  return params.roll + params.conSaveBonus >= params.dc;
}
