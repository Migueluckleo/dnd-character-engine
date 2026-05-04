// src/services/multiclass.service.ts
// T-030 | Spec: US-82 (AC 82.1–82.5)

import type { AbilityScores, ValidationResult } from '../types/index';

/** US-82.1 — Ability score prerequisites for each class */
type PrerequisiteRule =
  | { type: 'single'; ability: keyof AbilityScores; min: number }
  | { type: 'or'; options: Array<{ ability: keyof AbilityScores; min: number }> }
  | { type: 'and'; requirements: Array<{ ability: keyof AbilityScores; min: number }> };

const MULTICLASS_PREREQUISITES: Record<string, PrerequisiteRule> = {
  barbarian: { type: 'single',  ability: 'str', min: 13 },
  bard:      { type: 'single',  ability: 'cha', min: 13 },
  cleric:    { type: 'single',  ability: 'wis', min: 13 },
  druid:     { type: 'single',  ability: 'wis', min: 13 },
  fighter:   { type: 'or',     options: [{ ability: 'str', min: 13 }, { ability: 'dex', min: 13 }] },
  monk:      { type: 'and',    requirements: [{ ability: 'dex', min: 13 }, { ability: 'wis', min: 13 }] },
  paladin:   { type: 'and',    requirements: [{ ability: 'str', min: 13 }, { ability: 'cha', min: 13 }] },
  ranger:    { type: 'and',    requirements: [{ ability: 'dex', min: 13 }, { ability: 'wis', min: 13 }] },
  rogue:     { type: 'single',  ability: 'dex', min: 13 },
  sorcerer:  { type: 'single',  ability: 'cha', min: 13 },
  warlock:   { type: 'single',  ability: 'cha', min: 13 },
  wizard:    { type: 'single',  ability: 'int', min: 13 },
};

/**
 * US-82.1: Validate that a character meets the prerequisites to multiclass into a new class.
 * Pure function.
 */
export function validateMulticlassPrerequisites(
  classId: string,
  scores: AbilityScores,
): ValidationResult {
  const rule = MULTICLASS_PREREQUISITES[classId.toLowerCase()];
  if (!rule) {
    return { valid: false, errors: [`Unknown class: ${classId}`] };
  }

  const errors: string[] = [];

  if (rule.type === 'single') {
    if (scores[rule.ability] < rule.min) {
      errors.push(`Multiclassing into ${classId} requires ${rule.ability.toUpperCase()} ≥ ${rule.min}. Current: ${scores[rule.ability]}.`);
    }
  } else if (rule.type === 'or') {
    const anyMet = rule.options.some(o => scores[o.ability] >= o.min);
    if (!anyMet) {
      const req = rule.options.map(o => `${o.ability.toUpperCase()} ≥ ${o.min}`).join(' or ');
      errors.push(`Multiclassing into ${classId} requires ${req}.`);
    }
  } else if (rule.type === 'and') {
    for (const req of rule.requirements) {
      if (scores[req.ability] < req.min) {
        errors.push(`Multiclassing into ${classId} requires ${req.ability.toUpperCase()} ≥ ${req.min}. Current: ${scores[req.ability]}.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * US-82.5: Proficiency bonus is always based on TOTAL character level.
 * This is a reminder function — delegates to MathService.
 */
export { getProficiencyBonus as getProficiencyBonusByTotalLevel } from './math.service';
