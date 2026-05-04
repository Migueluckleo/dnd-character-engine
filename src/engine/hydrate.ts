// src/engine/hydrate.ts
// T-034 | Spec: plan.md §3 (Steps 1–10)
// Orchestrates all services in strict order.
// NEVER mutates input — always returns a new HydratedCharacter.

import { getModifier, getProficiencyBonus } from '../services/math.service';
import { calculateMaxHP, applyExhaustionToMaxHP } from '../services/health.service';
import { calculateAC } from '../services/ac.service';
import { buildSkillBonusMap } from '../services/skill.service';
import { calculatePassiveChecks } from '../services/passive-check.service';
import { calculateEncumbrance, getArmorSpeedPenalty } from '../services/inventory.service';
import { getConditionModifiers } from '../services/condition.service';
import { getInitiativeBonus } from '../services/initiative.service';
import type {
  HydratedCharacter, AbilityScores, AbilityModifiers, SkillBonus,
} from '../types/index';
import type { ActiveStateRecord } from '../services/condition.service';
import type { ClassEntry as HealthClassEntry } from '../services/health.service';
import type { ClassEntry as SlotClassEntry } from '../services/spell-slot.service';
import type { CharacterSkillRecord } from '../services/skill.service';
import type { InventoryItem } from '../services/inventory.service';
import type { SpellSlotTrackerRow } from '../services/spell-slot.service';

// ─── Input shape (raw DB data) ────────────────────────────────────────────────
export interface RawCharacter {
  id: string;
  name: string;
  // Base scores
  base_str: number; base_dex: number; base_con: number;
  base_int: number; base_wis: number; base_cha: number;
  // HP
  current_hp: number; temp_hp: number; is_dead: boolean;
  death_saves_success: number; death_saves_fail: number;
  // Concentration
  active_concentration_spell_id: string | null;
  // Speed
  base_speed: number;
  // XP
  xp: number; milestone_leveling: boolean; level_up_available: boolean;
  // Currency
  cp: number; sp: number; ep: number; gp: number; pp: number;
  has_inspiration: boolean;
  // Relations loaded
  classes: HealthClassEntry & SlotClassEntry & { isPrimary: boolean };
  racialBonuses: Partial<AbilityScores>;
  asiBonuses: Partial<AbilityScores>;
  featBonuses: Partial<AbilityScores>;
  traitEffects: Array<{ hpBonusPerLevel?: number }>;
  skillRecords: CharacterSkillRecord[];
  inventoryItems: (InventoryItem & {
    armorCategory: 'light' | 'medium' | 'heavy' | 'shield' | null;
    acBase: number | null;
    strengthRequirement: number | null;
    stealthDisadvantage: boolean;
  })[];
  spellSlotTrackers: SpellSlotTrackerRow[];
  activeState: ActiveStateRecord;
  hasJackOfAllTrades: boolean;
  hasAlertFeat: boolean;
  unArmoredOverride: 'barbarian' | 'monk' | 'none';
  spellcastingAbilityScore?: number;
}

/**
 * Main hydration function.
 * Runs all 10 engine steps in strict order.
 * Returns a fully computed HydratedCharacter — nothing is mutated.
 */
export function hydrate(raw: RawCharacter): HydratedCharacter {
  // ── Step 1: Ability Scores & Modifiers ──────────────────────────────────────
  const scores: AbilityScores = {
    str: raw.base_str + (raw.racialBonuses.str ?? 0) + (raw.asiBonuses.str ?? 0) + (raw.featBonuses.str ?? 0),
    dex: raw.base_dex + (raw.racialBonuses.dex ?? 0) + (raw.asiBonuses.dex ?? 0) + (raw.featBonuses.dex ?? 0),
    con: raw.base_con + (raw.racialBonuses.con ?? 0) + (raw.asiBonuses.con ?? 0) + (raw.featBonuses.con ?? 0),
    int: raw.base_int + (raw.racialBonuses.int ?? 0) + (raw.asiBonuses.int ?? 0) + (raw.featBonuses.int ?? 0),
    wis: raw.base_wis + (raw.racialBonuses.wis ?? 0) + (raw.asiBonuses.wis ?? 0) + (raw.featBonuses.wis ?? 0),
    cha: raw.base_cha + (raw.racialBonuses.cha ?? 0) + (raw.asiBonuses.cha ?? 0) + (raw.featBonuses.cha ?? 0),
  };
  const mods: AbilityModifiers = {
    str: getModifier(scores.str), dex: getModifier(scores.dex),
    con: getModifier(scores.con), int: getModifier(scores.int),
    wis: getModifier(scores.wis), cha: getModifier(scores.cha),
  };

  // ── Step 2: Proficiency Bonus ────────────────────────────────────────────────
  const totalLevel = (raw.classes as unknown as HealthClassEntry[])
    .reduce((s, c) => s + c.classLevel, 0);
  const profBonus = getProficiencyBonus(Math.max(1, totalLevel));

  // ── Step 3: Armor Class ──────────────────────────────────────────────────────
  const equippedBodyArmor = raw.inventoryItems.find(
    i => i.isEquipped && i.armorCategory && i.armorCategory !== 'shield'
  );
  const shieldEquipped = raw.inventoryItems.some(
    i => i.isEquipped && i.armorCategory === 'shield'
  );
  const armorClass = calculateAC({
    dexScore: scores.dex,
    conScore: scores.con,
    wisScore: scores.wis,
    equippedArmor: equippedBodyArmor
      ? { armorCategory: equippedBodyArmor.armorCategory, acBase: equippedBodyArmor.acBase ?? 10, strengthRequirement: equippedBodyArmor.strengthRequirement ?? undefined }
      : null,
    shieldEquipped,
    unArmoredOverride: { type: raw.unArmoredOverride },
  });

  // ── Step 4: Maximum HP ───────────────────────────────────────────────────────
  const baseMaxHp = calculateMaxHP(
    raw.classes as unknown as HealthClassEntry[],
    scores.con,
    raw.traitEffects,
  );

  // ── Step 5: Combat Calculations (delegated to combat.service per endpoint) ──

  // ── Step 6: Spell Slots (returned as-is from tracker; sync done at level-up) ─
  const spellSlots = raw.spellSlotTrackers.map(t => ({
    slotLevel: t.slotLevel,
    maxSlots: t.maxSlots,
    expendedSlots: t.expendedSlots,
    available: Math.max(0, t.maxSlots - t.expendedSlots),
    slotSource: t.slotSource,
  }));

  // ── Step 7: Passive Checks ───────────────────────────────────────────────────
  const findSkill = (id: string) => raw.skillRecords.find(s => s.skillId === id);
  const passiveChecks = calculatePassiveChecks({
    scores,
    totalLevel,
    isPerceptionProficient:    findSkill('perception')?.isProficient    ?? false,
    isInvestigationProficient: findSkill('investigation')?.isProficient ?? false,
    isInsightProficient:       findSkill('insight')?.isProficient       ?? false,
    isPerceptionExpertise:    findSkill('perception')?.isExpertise    ?? false,
    isInvestigationExpertise: findSkill('investigation')?.isExpertise ?? false,
    isInsightExpertise:       findSkill('insight')?.isExpertise       ?? false,
    hasJackOfAllTrades: raw.hasJackOfAllTrades,
  });

  // ── Step 8: Encumbrance ───────────────────────────────────────────────────────
  const totalCoins = raw.cp + raw.sp + raw.ep + raw.gp + raw.pp;
  const encumbrance = calculateEncumbrance(raw.inventoryItems, scores.str, totalCoins);
  const armorSpeedPenalty = equippedBodyArmor
    ? getArmorSpeedPenalty(scores.str, equippedBodyArmor.strengthRequirement)
    : 0;

  // ── Step 9: Conditions & Exhaustion ──────────────────────────────────────────
  const condMods = getConditionModifiers(raw.activeState);
  const effectiveMaxHp = applyExhaustionToMaxHP(baseMaxHp, raw.activeState.exhaustionLevel);

  let speed = raw.base_speed;
  if (condMods.speedMultiplier === 0) speed = 0;
  else if (condMods.speedMultiplier < 1) speed = Math.floor(raw.base_speed * condMods.speedMultiplier);
  speed = Math.max(0, speed - armorSpeedPenalty);

  // ── Step 10: Death State & Temp HP Buffer ────────────────────────────────────
  // (resolved at damage-application time; hydration reflects current state)

  // ── Skills ───────────────────────────────────────────────────────────────────
  const skills: SkillBonus[] = buildSkillBonusMap(
    scores, totalLevel, raw.skillRecords, raw.hasJackOfAllTrades
  );

  // ── Initiative ───────────────────────────────────────────────────────────────
  const { initiativeBonus } = getInitiativeBonus({
    dexScore: scores.dex,
    totalLevel,
    hasJackOfAllTrades: raw.hasJackOfAllTrades,
    hasAlertFeat: raw.hasAlertFeat,
  });

  return {
    id: raw.id,
    name: raw.name,
    totalLevel,
    proficiencyBonus: profBonus,
    abilityScores: scores,
    abilityModifiers: mods,
    maxHp: effectiveMaxHp,
    currentHp: raw.current_hp,
    tempHp: raw.temp_hp,
    isDead: raw.is_dead,
    armorClass,
    initiativeBonus,
    speed,
    deathSavesSuccess: raw.death_saves_success,
    deathSavesFail: raw.death_saves_fail,
    skills,
    passiveChecks,
    activeConcentrationSpellId: raw.active_concentration_spell_id,
    conditions: {
      isBlinded:        raw.activeState.isBlinded,
      isCharmed:        raw.activeState.isCharmed,
      isDeafened:       raw.activeState.isDeafened,
      isFrightened:     raw.activeState.isFrightened,
      isGrappled:       raw.activeState.isGrappled,
      isIncapacitated:  raw.activeState.isIncapacitated,
      isInvisible:      raw.activeState.isInvisible,
      isParalyzed:      raw.activeState.isParalyzed,
      isPetrified:      raw.activeState.isPetrified,
      isPoisoned:       raw.activeState.isPoisoned,
      isProne:          raw.activeState.isProne,
      isRestrained:     raw.activeState.isRestrained,
      isStunned:        raw.activeState.isStunned,
      isUnconscious:    raw.activeState.isUnconscious,
      exhaustionLevel:  raw.activeState.exhaustionLevel,
      reactionAvailable: raw.activeState.reactionAvailable,
    },
    spellSlots,
    carriedWeight: encumbrance.carriedWeight,
    carryingCapacity: encumbrance.carryingCapacity,
    isEncumbered: encumbrance.isEncumbered,
  };
}
