// src/services/passive-check.service.ts
// T-023 | Spec: FR-12, US-76 (AC 76.1–76.5)

import { getModifier, getProficiencyBonus, getHalfProficiencyBonus } from './math.service';
import type { AbilityScores, PassiveChecks } from '../types/index';

export interface PassiveCheckInput {
  scores: AbilityScores;
  totalLevel: number;
  isPerceptionProficient: boolean;
  isInvestigationProficient: boolean;
  isInsightProficient: boolean;
  isPerceptionExpertise: boolean;
  isInvestigationExpertise: boolean;
  isInsightExpertise: boolean;
  hasJackOfAllTrades: boolean;
  perceptionAdvantage?: boolean;
  perceptionDisadvantage?: boolean;
}

/**
 * FR-12 + US-76: Calculate all three passive check scores.
 * passive = 10 + total_bonus [+5 advantage / -5 disadvantage]
 * Jack of All Trades applies to unproficient skills (Bard, US-27.4).
 */
export function calculatePassiveChecks(input: PassiveCheckInput): PassiveChecks {
  const profBonus = getProficiencyBonus(input.totalLevel);
  const halfProf = getHalfProficiencyBonus(input.totalLevel);

  function skillBonus(
    abilityScore: number,
    isProficient: boolean,
    isExpertise: boolean,
  ): number {
    const mod = getModifier(abilityScore);
    if (isExpertise) return mod + profBonus * 2;
    if (isProficient) return mod + profBonus;
    if (input.hasJackOfAllTrades) return mod + halfProf;
    return mod;
  }

  const perceptionBonus = skillBonus(
    input.scores.wis,
    input.isPerceptionProficient,
    input.isPerceptionExpertise,
  );
  const advantageOffset =
    input.perceptionAdvantage ? 5 : input.perceptionDisadvantage ? -5 : 0;

  return {
    passivePerception:    10 + perceptionBonus + advantageOffset,
    passiveInvestigation: 10 + skillBonus(input.scores.int, input.isInvestigationProficient, input.isInvestigationExpertise),
    passiveInsight:       10 + skillBonus(input.scores.wis, input.isInsightProficient, input.isInsightExpertise),
  };
}
