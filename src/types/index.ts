// src/types/index.ts
// Shared TypeScript types consumed by all services and controllers
// Convention: camelCase in code, snake_case in DB (.claude.md §4)

// ─── Ability Score Keys ───────────────────────────────────────────────────────
export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

// ─── US-77: The 18 valid skill IDs ───────────────────────────────────────────
export const VALID_SKILL_IDS = [
  'acrobatics', 'animal_handling', 'arcana', 'athletics', 'deception',
  'history', 'insight', 'intimidation', 'investigation', 'medicine',
  'nature', 'perception', 'performance', 'persuasion', 'religion',
  'sleight_of_hand', 'stealth', 'survival',
] as const;
export type SkillId = typeof VALID_SKILL_IDS[number];

// Map: skill → governing ability (US-77.1)
export const SKILL_ABILITY_MAP: Record<SkillId, AbilityKey> = {
  acrobatics:     'dex',
  animal_handling:'wis',
  arcana:         'int',
  athletics:      'str',
  deception:      'cha',
  history:        'int',
  insight:        'wis',
  intimidation:   'cha',
  investigation:  'int',
  medicine:       'wis',
  nature:         'int',
  perception:     'wis',
  performance:    'cha',
  persuasion:     'cha',
  religion:       'int',
  sleight_of_hand:'dex',
  stealth:        'dex',
  survival:       'wis',
};

// ─── US-80: Condition IDs ─────────────────────────────────────────────────────
export const CONDITION_IDS = [
  'blinded', 'charmed', 'deafened', 'exhaustion', 'frightened', 'grappled',
  'incapacitated', 'invisible', 'paralyzed', 'petrified', 'poisoned',
  'prone', 'restrained', 'stunned', 'unconscious',
] as const;
export type ConditionId = typeof CONDITION_IDS[number];

// ─── Hydrated Character (output of the Engine) ───────────────────────────────
// This is the fully-computed character sheet — no derived value is stored in DB
export interface AbilityScores {
  str: number; dex: number; con: number;
  int: number; wis: number; cha: number;
}

export interface AbilityModifiers {
  str: number; dex: number; con: number;
  int: number; wis: number; cha: number;
}

export interface SkillBonus {
  skillId: SkillId;
  abilityKey: AbilityKey;
  bonus: number;
  isProficient: boolean;
  isExpertise: boolean;
}

export interface SpellSlotState {
  slotLevel: number;
  maxSlots: number;
  expendedSlots: number;
  available: number;
  slotSource: 'standard' | 'pact_magic';
}

export interface ConditionState {
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
  exhaustionLevel: number;
  reactionAvailable: boolean;
}

export interface PassiveChecks {
  passivePerception: number;
  passiveInvestigation: number;
  passiveInsight: number;
}

export interface HydratedCharacter {
  // Identity
  id: string;
  name: string;
  totalLevel: number;
  proficiencyBonus: number;

  // Scores & modifiers (computed)
  abilityScores: AbilityScores;
  abilityModifiers: AbilityModifiers;

  // Derived combat stats (computed)
  maxHp: number;
  currentHp: number;
  tempHp: number;
  isDead: boolean;
  armorClass: number;
  initiativeBonus: number;
  speed: number;

  // Death Saves
  deathSavesSuccess: number;
  deathSavesFail: number;

  // Skills
  skills: SkillBonus[];
  passiveChecks: PassiveChecks;

  // Concentration
  activeConcentrationSpellId: string | null;

  // Conditions
  conditions: ConditionState;

  // Spell slots
  spellSlots: SpellSlotState[];

  // Encumbrance
  carriedWeight: number;
  carryingCapacity: number;
  isEncumbered: boolean;
}

// ─── API Error shape (.claude.md §5) ─────────────────────────────────────────
export interface ApiError {
  httpStatus: number;
  developerMessage: string;    // English — for logs/debugging
  clientMessage: string;       // Spanish — shown to user
}

// ─── Validation ───────────────────────────────────────────────────────────────
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  pointsUsed?: number;
}

export interface PointBuyInput {
  str: number; dex: number; con: number;
  int: number; wis: number; cha: number;
}
