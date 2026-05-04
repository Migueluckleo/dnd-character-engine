// src/services/skill.service.ts
// T-022 | Spec: US-77 (AC 77.1–77.3), US-27.4 (Jack of All Trades)

import { getModifier, getProficiencyBonus, getHalfProficiencyBonus } from './math.service';
import {
  VALID_SKILL_IDS, SKILL_ABILITY_MAP,
  type SkillId, type AbilityScores, type SkillBonus,
} from '../types/index';

export interface CharacterSkillRecord {
  skillId: SkillId;
  isProficient: boolean;
  isExpertise: boolean;
}

/**
 * US-77.2 + US-27.4: Build the full skill bonus map.
 * Jack of All Trades (Bard, level >= 2) adds half proficiency to unproficient skills.
 * Pure function.
 */
export function buildSkillBonusMap(
  scores: AbilityScores,
  totalLevel: number,
  skillRecords: CharacterSkillRecord[],
  hasJackOfAllTrades: boolean,
): SkillBonus[] {
  const profBonus = getProficiencyBonus(totalLevel);
  const halfProf = getHalfProficiencyBonus(totalLevel);

  const recordMap = new Map(skillRecords.map(r => [r.skillId, r]));

  return VALID_SKILL_IDS.map((skillId): SkillBonus => {
    const abilityKey = SKILL_ABILITY_MAP[skillId];
    const abilityMod = getModifier(scores[abilityKey]);
    const record = recordMap.get(skillId);
    const isProficient = record?.isProficient ?? false;
    const isExpertise = record?.isExpertise ?? false;

    let bonus = abilityMod;
    if (isExpertise) {
      // US-77.2: double proficiency
      bonus += profBonus * 2;
    } else if (isProficient) {
      bonus += profBonus;
    } else if (hasJackOfAllTrades) {
      // US-27.4: half proficiency (floor) for unproficient ability checks only
      bonus += halfProf;
    }

    return { skillId, abilityKey, bonus, isProficient, isExpertise };
  });
}

/**
 * US-77.3: Validate a skill ID against the official 18-skill catalog.
 */
export function validateSkillId(id: string): id is SkillId {
  return (VALID_SKILL_IDS as readonly string[]).includes(id);
}
