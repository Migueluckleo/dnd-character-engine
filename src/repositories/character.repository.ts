// src/repositories/character.repository.ts
// DAL — all DB I/O lives here. No business logic.

import { PrismaClient } from '@prisma/client';
import type { RawCharacter } from '../engine/hydrate';

const prisma = new PrismaClient();

/** Load a character with all relations needed for hydration */
export async function findCharacterById(id: string) {
  return prisma.character.findUnique({
    where: { id },
    include: {
      character_classes: { include: { class: true, subclass: true } },
      character_skills:  true,
      character_tools:   true,
      character_traits:  { include: { trait: true } },
      character_feats:   { include: { feat: true } },
      character_languages: { include: { language: true } },
      inventory_items:   { include: { item: true } },
      known_spells:      { include: { spell: true } },
      spell_slot_trackers: true,
      hit_dice_trackers:   true,
      resource_pools:      true,
      active_state:        true,
      race:                true,
      background:          true,
    },
  });
}

type PrismaCharacter = NonNullable<Awaited<ReturnType<typeof findCharacterById>>>;

/**
 * Adapts a Prisma character (snake_case, flat relations) to the RawCharacter
 * shape expected by hydrate(). This is the single source of truth for
 * translating DB → engine.
 */
export function buildRawCharacter(c: PrismaCharacter): RawCharacter {
  const race = c.race as any;
  const racialBonuses: Partial<Record<string, number>> =
    (race?.ability_bonuses as Record<string, number>) ?? {};

  // Classes
  const classes = (c.character_classes as any[]).map((cc) => ({
    classId:   cc.class_id,
    hitDie:    cc.class?.hit_die ?? 8,
    casterType: (cc.class?.caster_type ?? 'none') as 'full' | 'half' | 'none',
    classLevel: cc.class_level,
    isPrimary:  cc.is_primary,
  }));

  // Skills
  const skillRecords = (c.character_skills as any[]).map((sk) => ({
    skillId:      sk.skill_id,
    isProficient: sk.is_proficient,
    isExpertise:  sk.is_expertise ?? false,
  }));

  // Inventory — map snake_case item fields to camelCase for hydrate
  const inventoryItems = (c.inventory_items as any[]).map((inv) => ({
    itemId:              inv.item_id,
    weight:              inv.item?.weight ?? 0,
    quantity:            inv.quantity ?? 1,
    isEquipped:          inv.is_equipped,
    isAttuned:           inv.is_attuned ?? false,
    armorCategory:       inv.item?.armor_category ?? null,
    acBase:              inv.item?.ac_base ?? null,
    strengthRequirement: inv.item?.strength_requirement ?? null,
    stealthDisadvantage: inv.item?.stealth_disadvantage ?? false,
  }));

  // Spell slot trackers
  const spellSlotTrackers = (c.spell_slot_trackers as any[]).map((s) => ({
    classId:      s.class_id,
    slotLevel:    s.slot_level,
    maxSlots:     s.max_slots,
    expendedSlots: s.expended_slots,
    slotSource:   (s.slot_source ?? 'standard') as 'standard' | 'pact_magic',
  }));

  // Active state (safe defaults for characters missing this row)
  const as = (c.active_state as any) ?? {};
  const activeState = {
    exhaustionLevel:   as.exhaustion_level   ?? 0,
    reactionAvailable: as.reaction_available ?? true,
    isBlinded:         as.is_blinded         ?? false,
    isCharmed:         as.is_charmed         ?? false,
    isDeafened:        as.is_deafened        ?? false,
    isFrightened:      as.is_frightened      ?? false,
    isGrappled:        as.is_grappled        ?? false,
    isIncapacitated:   as.is_incapacitated   ?? false,
    isInvisible:       as.is_invisible       ?? false,
    isParalyzed:       as.is_paralyzed       ?? false,
    isPetrified:       as.is_petrified       ?? false,
    isPoisoned:        as.is_poisoned        ?? false,
    isProne:           as.is_prone           ?? false,
    isRestrained:      as.is_restrained      ?? false,
    isStunned:         as.is_stunned         ?? false,
    isUnconscious:     as.is_unconscious     ?? false,
  };

  // Trait effects (e.g. Hill Dwarf +1 HP/level, Tough feat +2 HP/level)
  const traitEffects = (c.character_traits as any[])
    .map((ct) => ({ hpBonusPerLevel: ct.trait?.hp_bonus_per_level ?? 0 }))
    .filter((t) => t.hpBonusPerLevel > 0);

  // Feats that grant ability score bonuses (rare in SRD, but slot available)
  const featBonuses: Partial<Record<string, number>> = {};
  for (const cf of c.character_feats as any[]) {
    const bonuses = cf.feat?.ability_bonuses as Record<string, number> | null;
    if (bonuses) {
      for (const [k, v] of Object.entries(bonuses)) {
        featBonuses[k] = (featBonuses[k] ?? 0) + v;
      }
    }
  }

  // Special feats / features derived from class features / traits / feats
  const featNames = (c.character_feats as any[]).map((cf) =>
    (cf.feat?.name ?? '').toLowerCase(),
  );
  const traitNames = (c.character_traits as any[]).map((ct) =>
    (ct.trait?.name ?? '').toLowerCase(),
  );
  const hasJackOfAllTrades = traitNames.some((n) => n.includes('jack of all trades'));
  const hasAlertFeat       = featNames.some((n) => n.includes('alert'));

  // Unarmored defense override from primary class
  const primaryClass = classes.find((cl) => cl.isPrimary);
  const primaryClassName = (
    (c.character_classes as any[]).find((cc) => cc.is_primary)?.class?.name ?? ''
  ).toLowerCase();
  const unArmoredOverride: 'barbarian' | 'monk' | 'none' =
    primaryClassName === 'barbarian' ? 'barbarian' :
    primaryClassName === 'monk'      ? 'monk'      : 'none';

  // Spellcasting ability score for DC/attack bonus (passed as raw score)
  const spellcastingAbility: string | null =
    (c.character_classes as any[]).find((cc) => cc.is_primary)?.class?.spellcasting_ability ?? null;
  const finalScores: Record<string, number> = {
    str: c.base_str + (racialBonuses['str'] ?? 0),
    dex: c.base_dex + (racialBonuses['dex'] ?? 0),
    con: c.base_con + (racialBonuses['con'] ?? 0),
    int: c.base_int + (racialBonuses['int'] ?? 0),
    wis: c.base_wis + (racialBonuses['wis'] ?? 0),
    cha: c.base_cha + (racialBonuses['cha'] ?? 0),
  };
  const spellcastingAbilityScore = spellcastingAbility
    ? (finalScores[spellcastingAbility] ?? 10)
    : undefined;

  return {
    id:   c.id,
    name: c.name,
    base_str: c.base_str,
    base_dex: c.base_dex,
    base_con: c.base_con,
    base_int: c.base_int,
    base_wis: c.base_wis,
    base_cha: c.base_cha,
    current_hp:           c.current_hp,
    temp_hp:              c.temp_hp,
    is_dead:              c.is_dead,
    death_saves_success:  c.death_saves_success,
    death_saves_fail:     c.death_saves_fail,
    active_concentration_spell_id: c.active_concentration_spell_id,
    base_speed:           race?.base_speed ?? c.base_speed ?? 30,
    xp:                   c.xp,
    milestone_leveling:   c.milestone_leveling,
    level_up_available:   c.level_up_available,
    cp: c.cp, sp: c.sp, ep: c.ep, gp: c.gp, pp: c.pp,
    has_inspiration:      c.has_inspiration,
    classes:              classes as any,
    racialBonuses:        { str: racialBonuses['str'] ?? 0, dex: racialBonuses['dex'] ?? 0, con: racialBonuses['con'] ?? 0, int: racialBonuses['int'] ?? 0, wis: racialBonuses['wis'] ?? 0, cha: racialBonuses['cha'] ?? 0 },
    asiBonuses:           {},   // already baked into base_* at creation
    featBonuses:          featBonuses as any,
    traitEffects,
    skillRecords,
    inventoryItems:       inventoryItems as any,
    spellSlotTrackers,
    activeState,
    hasJackOfAllTrades,
    hasAlertFeat,
    unArmoredOverride,
    spellcastingAbilityScore,
    // level_1_hp_roll forwarded for HP calculation
    ...(c.level_1_hp_roll != null ? { level_1_hp_roll: c.level_1_hp_roll } : {}),
  } as unknown as RawCharacter;
}

export async function createCharacter(data: Parameters<typeof prisma.character.create>[0]['data']) {
  return prisma.character.create({ data });
}

export async function updateCharacter(
  id: string,
  data: Parameters<typeof prisma.character.update>[0]['data'],
) {
  return prisma.character.update({ where: { id }, data });
}

export async function upsertActiveState(
  characterId: string,
  data: Omit<Parameters<typeof prisma.activeState.upsert>[0]['update'], 'character'>,
) {
  return prisma.activeState.upsert({
    where:  { character_id: characterId },
    create: { character_id: characterId, ...(data as object) },
    update: data,
  });
}

export { prisma };
