// src/api/controllers/character.controller.ts
// T-036–040 | US-89 (roster/delete) | US-90 (wizard POST) | US-103 (level-up) | US-106 (hydrated)
// Spec: plan.md §5 Character Management

import { Router } from 'express';
import { z } from 'zod';
import { pointBuyGuard, skillSelectionGuard, deadCharacterGuard } from '../middleware/guards';
import { AppError } from '../middleware/error-handler';
import { validateMulticlassPrerequisites } from '../../services/multiclass.service';
import { addXP, isLevelUpAvailable, getXPForLevel, XP_THRESHOLDS } from '../../services/xp.service';
import { findCharacterById, buildRawCharacter, createCharacter, updateCharacter, prisma } from '../../repositories/character.repository';
import { hydrate } from '../../engine/hydrate';
import { currentAuthUser } from '../middleware/auth';

export const characterRouter = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the total number of spells known (for "known spells" classes) at a given level.
 * For prepared-spell classes, returns the number the creation wizard asks the
 * player to select as prepared/starting spells so the detail sheet is not empty.
 */
function getSpellsKnownAtLevel(
  className: string,
  level: number,
  baseKnown: number,
  scores: Record<string, number> = {},
  spellcastingAbility?: string | null,
): number {
  const lc = className.toLowerCase();
  const tables: Record<string, number[]> = {
    bard:     [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
    sorcerer: [0, 2, 3, 4,  5, 6, 7,  8,  9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
    ranger:   [0, 0, 2, 3,  3, 4, 4,  5,  5,  6,  6,  7,  7,  8,  8,  9,  9, 10, 10, 11, 11],
    warlock:  [0, 2, 2, 2,  3, 3, 3,  4,  4,  5,  5,  5,  6,  6,  7,  7,  7,  8,  8,  9,  9],
  };
  const table = tables[lc];
  if (table) return table[Math.min(level, 20)] ?? 0;

  const ability = spellcastingAbility ?? (lc === 'paladin' ? 'cha' : lc === 'wizard' ? 'int' : 'wis');
  const abilityMod = Math.floor(((scores[ability] ?? 10) - 10) / 2);
  if (lc === 'cleric' || lc === 'druid') return Math.max(1, level + abilityMod);
  if (lc === 'paladin') return level < 2 ? 0 : Math.max(1, Math.floor(level / 2) + abilityMod);
  if (lc === 'wizard') return Math.max(baseKnown, 6 + Math.max(0, level - 1) * 2);
  return baseKnown;
}

/**
 * Returns the total cantrips known at a given level for caster classes.
 */
function getCantripsAtLevel(className: string, level: number, baseCount: number): number {
  const lc = className.toLowerCase();
  const tables: Record<string, number[]> = {
    bard:     [0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    cleric:   [0, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    druid:    [0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    sorcerer: [0, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    warlock:  [0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    wizard:   [0, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  };
  const t = tables[lc];
  if (t) return t[Math.min(level, 20)] ?? 0;
  return baseCount;
}

function getMaxSpellLevel(className: string, level: number): number {
  const lc = className.toLowerCase();
  if (lc === 'paladin' || lc === 'ranger') {
    if (level < 2) return 0;
    return Math.min(Math.floor((level + 1) / 4) + 1, 5);
  }
  const table = [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 9];
  return table[Math.min(level, 20)] ?? 0;
}

const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
type AbilityKey = typeof ABILITY_KEYS[number];

function getAsiMilestones(className: string, level: number): number[] {
  const lc = className.toLowerCase();
  const milestones = lc === 'fighter'
    ? [4, 6, 8, 12, 14, 16, 19]
    : lc === 'rogue'
      ? [4, 8, 10, 12, 16, 19]
      : [4, 8, 12, 16, 19];
  return milestones.filter(m => m <= level);
}

function validateAsiAdjustments(
  asiAdj: Record<string, number>,
  className: string,
  level: number,
  baseScores: Record<AbilityKey, number>,
  racialBonuses: Record<string, number>,
): void {
  const milestones = getAsiMilestones(className, level);
  const expectedPoints = milestones.length * 2;
  const entries = Object.entries(asiAdj);

  for (const [key, value] of entries) {
    if (!ABILITY_KEYS.includes(key as AbilityKey)) {
      throw new AppError(422, `Invalid ASI ability key: ${key}`, `Mejora de atributo inválida: ${key}.`);
    }
    if (!Number.isInteger(value) || value < 0) {
      throw new AppError(422, `Invalid ASI value for ${key}: ${value}`, `La mejora de ${key} debe ser un entero positivo.`);
    }
  }

  const totalPoints = entries.reduce((sum, [, value]) => sum + value, 0);
  if (totalPoints !== expectedPoints) {
    throw new AppError(422,
      `ASI point total mismatch: expected ${expectedPoints}, got ${totalPoints}.`,
      expectedPoints > 0
        ? `Debes asignar exactamente ${expectedPoints} puntos de mejora de atributos para este nivel.`
        : 'Este nivel no otorga mejoras de atributos.',
    );
  }

  for (const stat of ABILITY_KEYS) {
    const finalScore = baseScores[stat] + (asiAdj[stat] ?? 0) + (racialBonuses[stat] ?? 0);
    if (finalScore > 20) {
      throw new AppError(422,
        `ASI exceeds ability score cap for ${stat}: ${finalScore}.`,
        `La puntuación final de ${stat} no puede superar 20 con mejoras de atributos.`,
      );
    }
  }
}

async function addEquipmentByItem(
  entries: Map<string, number>,
  item: { item_id: string; name: string; item_type: string; pack_contents: unknown },
  quantity: number,
): Promise<void> {
  const normalizedQuantity = normalizeAmmunitionQuantity(item, quantity);
  if (item.item_type === 'pack' && item.pack_contents) {
    const contents = item.pack_contents as Array<{ item?: string; item_id?: string; qty?: number; quantity?: number }>;
    for (const entry of contents) {
      const child = await prisma.item.findFirst({
        where: entry.item_id
          ? { item_id: entry.item_id }
          : { name: { equals: entry.item ?? '', mode: 'insensitive' } },
      });
      if (child) {
        const childQty = normalizeAmmunitionQuantity(child, entry.quantity ?? entry.qty ?? 1) * normalizedQuantity;
        entries.set(child.item_id, (entries.get(child.item_id) ?? 0) + childQty);
      }
    }
    return;
  }
  entries.set(item.item_id, (entries.get(item.item_id) ?? 0) + normalizedQuantity);
}

function normalizeAmmunitionQuantity(item: { name: string; item_type: string }, quantity: number): number {
  const match = item.item_type === 'ammunition' ? item.name.match(/\((\d+)\)$/) : null;
  const bundleSize = match ? Number(match[1]) : 0;
  return bundleSize ? Math.max(quantity, bundleSize) : quantity;
}

async function addEquipmentByName(entries: Map<string, number>, itemName: string, quantity: number): Promise<void> {
  const item = await prisma.item.findFirst({ where: { name: { equals: itemName, mode: 'insensitive' } } });
  if (item) await addEquipmentByItem(entries, item, quantity);
}

async function addEquipmentById(entries: Map<string, number>, itemId: string, quantity: number): Promise<void> {
  const item = await prisma.item.findUnique({ where: { item_id: itemId } });
  if (!item) throw new AppError(422, `Item not found: ${itemId}`, `Objeto no encontrado: ${itemId}.`);
  await addEquipmentByItem(entries, item, quantity);
}

/** D&D SRD skill → governing ability mapping */
const SKILL_ABILITY: Record<string, string> = {
  acrobatics: 'dex', animal_handling: 'wis', arcana: 'int', athletics: 'str',
  deception: 'cha', history: 'int', insight: 'wis', intimidation: 'cha',
  investigation: 'int', medicine: 'wis', nature: 'int', perception: 'wis',
  performance: 'cha', persuasion: 'cha', religion: 'int', sleight_of_hand: 'dex',
  stealth: 'dex', survival: 'wis',
};

/**
 * Returns resource pool seed data for a class at a given level.
 * Only pools that exist at L1 are included (rage, second_wind, lay_on_hands,
 * bardic_inspiration). ki and action_surge start at L2.
 */
function getClassResourcePools(
  className: string,
  level: number,
  scores: Record<string, number>,
): Array<{ pool_id: string; current: number; max: number; reset_on: 'short_rest' | 'long_rest' }> {
  const pools: Array<{ pool_id: string; current: number; max: number; reset_on: 'short_rest' | 'long_rest' }> = [];
  const lc = className.toLowerCase();
  const chaMod = Math.floor(((scores['cha'] ?? 10) - 10) / 2);

  if (lc === 'barbarian') {
    const rages = level < 3 ? 2 : level < 6 ? 3 : level < 12 ? 4 : level < 17 ? 5 : level < 20 ? 6 : 999;
    pools.push({ pool_id: 'rage', current: rages, max: rages, reset_on: 'long_rest' });
  }
  if (lc === 'fighter') {
    pools.push({ pool_id: 'second_wind', current: 1, max: 1, reset_on: 'short_rest' });
    if (level >= 2) pools.push({ pool_id: 'action_surge', current: 1, max: 1, reset_on: 'short_rest' });
  }
  if (lc === 'paladin') {
    const lohMax = level * 5;
    pools.push({ pool_id: 'lay_on_hands', current: lohMax, max: lohMax, reset_on: 'long_rest' });
  }
  if (lc === 'monk' && level >= 2) {
    pools.push({ pool_id: 'ki', current: level, max: level, reset_on: 'short_rest' });
  }
  if (lc === 'bard') {
    const biMax = Math.max(1, chaMod);
    // At L1 Bardic Inspiration recharges on long rest; short rest at L5+
    pools.push({ pool_id: 'bardic_inspiration', current: biMax, max: biMax, reset_on: level >= 5 ? 'short_rest' : 'long_rest' });
  }
  if (lc === 'sorcerer') {
    // Sorcery points start at L2
    if (level >= 2) pools.push({ pool_id: 'sorcery_points', current: level, max: level, reset_on: 'long_rest' });
  }

  return pools;
}

// ─── GET /characters ──────────────────────────────────────────────────────────
// US-89: Character roster — list all characters, or only the active profile's characters when logged in.
characterRouter.get('/', async (req, res, next) => {
  try {
    const authUser = currentAuthUser(req);
    const characters = await prisma.character.findMany({
      where: authUser ? { user_id: authUser.user_id } : undefined,
      select: {
        id: true, name: true, alignment: true, xp: true,
        current_hp: true, is_dead: true, base_con: true,
        race: { select: { name: true, base_speed: true, ability_bonuses: true } },
        background: { select: { name: true } },
        character_classes: {
          select: {
            class_level: true, is_primary: true,
            class: { select: { name: true, hit_die: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(characters);
  } catch (err) { next(err); }
});

// ─── DELETE /characters/:id ────────────────────────────────────────────────────
// US-89: Delete character — all child rows cascade via schema onDelete: Cascade
characterRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.character.findUnique({ where: { id: req.params['id']! } });
    if (!existing) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    await prisma.character.delete({ where: { id: req.params['id']! } });
    res.json({ message: 'Personaje eliminado correctamente.' });
  } catch (err) { next(err); }
});

// ─── POST /characters ─────────────────────────────────────────────────────────
// US-90–107: Full wizard creation — accepts both minimal and full wizard payloads
const WizardCharacterSchema = z.object({
  name:          z.string().min(1),
  race_id:       z.string(),
  background_id: z.string(),
  alignment:     z.string().optional().default('true_neutral'),
  ability_scores: z.object({
    str: z.number().int(), dex: z.number().int(), con: z.number().int(),
    int: z.number().int(), wis: z.number().int(), cha: z.number().int(),
  }),
  class_id:           z.string(),
  milestone_leveling: z.boolean().optional().default(false),
  // Wizard extras (all optional for backward compat)
  subclass_id:        z.string().optional(),
  skill_selections:   z.array(z.string()).optional().default([]),
  cantrip_selections: z.array(z.string()).optional().default([]),
  spell_selections:   z.array(z.string()).optional().default([]),
  equipment_selections: z.array(z.object({
    item_id:  z.string(),
    quantity: z.number().int().positive().optional().default(1),
  })).optional().default([]),
  personality_traits: z.string().optional(),
  bonds:              z.string().optional(),
  ideals:             z.string().optional(),
  flaws:              z.string().optional(),
  background_variant: z.string().optional(),
  // US-111: initial level (1–20); defaults to 1
  initial_level:      z.number().int().min(1).max(20).optional().default(1),
  hp_roll_base:       z.number().int().min(1).optional(),
  // ASI bonuses chosen during wizard for characters created above level 4
  // Keys are ability names (str/dex/con/int/wis/cha), values are point bonuses (≥0)
  asi_adjustments:    z.record(z.string(), z.number().int().min(0).max(20)).optional().default({}),
});

characterRouter.post('/', pointBuyGuard, async (req, res, next) => {
  try {
    const body = WizardCharacterSchema.parse(req.body);
    const { ability_scores: s } = body;
    const authUser = currentAuthUser(req);

    // ── 1. Resolve Race (by UUID or name) ──
    const race = await prisma.race.findFirst({
      where: { OR: [{ race_id: body.race_id }, { name: { equals: body.race_id, mode: 'insensitive' } }] },
    });
    if (!race) throw new AppError(422, `Race not found: ${body.race_id}`, `Raza no encontrada: ${body.race_id}`);

    // ── 2. Resolve Class (by UUID or name) ──
    const cls = await prisma.class.findFirst({
      where: { OR: [{ class_id: body.class_id }, { name: { equals: body.class_id, mode: 'insensitive' } }] },
    });
    if (!cls) throw new AppError(422, `Class not found: ${body.class_id}`, `Clase no encontrada: ${body.class_id}`);

    // ── 3. Resolve Background (by UUID or name) ──
    const bg = await prisma.background.findFirst({
      where: { OR: [{ background_id: body.background_id }, { name: { equals: body.background_id, mode: 'insensitive' } }] },
    });
    if (!bg) throw new AppError(422, `Background not found: ${body.background_id}`, `Trasfondo no encontrado: ${body.background_id}`);

    const asiAdj = body.asi_adjustments ?? {};
    const racialBonuses = (race.ability_bonuses as Record<string, number>) ?? {};
    const baseScores = {
      str: s.str, dex: s.dex, con: s.con,
      int: s.int, wis: s.wis, cha: s.cha,
    };
    validateAsiAdjustments(asiAdj, cls.name, body.initial_level, baseScores, racialBonuses);

    const finalScores = {
      str: s.str + (asiAdj['str'] ?? 0) + (racialBonuses['str'] ?? 0),
      dex: s.dex + (asiAdj['dex'] ?? 0) + (racialBonuses['dex'] ?? 0),
      con: s.con + (asiAdj['con'] ?? 0) + (racialBonuses['con'] ?? 0),
      int: s.int + (asiAdj['int'] ?? 0) + (racialBonuses['int'] ?? 0),
      wis: s.wis + (asiAdj['wis'] ?? 0) + (racialBonuses['wis'] ?? 0),
      cha: s.cha + (asiAdj['cha'] ?? 0) + (racialBonuses['cha'] ?? 0),
    };

    // ── 4. Validate skill selections vs class pool ──
    const skillChoices = cls.starting_skill_choices as { count: number; pool: string[] | null };
    if (body.skill_selections.length > skillChoices.count) {
      throw new AppError(422,
        `Too many skill selections: max ${skillChoices.count}, got ${body.skill_selections.length}`,
        `Demasiadas habilidades: máximo ${skillChoices.count}, recibidas ${body.skill_selections.length}.`,
      );
    }
    if (skillChoices.pool !== null) {
      const invalid = body.skill_selections.filter(sk => !skillChoices.pool!.includes(sk));
      if (invalid.length > 0) {
        throw new AppError(422,
          `Skills not in ${cls.name} pool: ${invalid.join(', ')}`,
          `Habilidades fuera del pool de ${cls.name}: ${invalid.join(', ')}.`,
        );
      }
    }

    // ── 5. Validate cantrip count (scaled to initial_level) ──
    const expectedCantrips = getCantripsAtLevel(cls.name, body.initial_level, cls.starting_cantrip_count);
    if (body.cantrip_selections.length !== expectedCantrips) {
      throw new AppError(422,
        `Invalid cantrip count: expected ${expectedCantrips} at level ${body.initial_level}, got ${body.cantrip_selections.length}`,
        `Debes seleccionar exactamente ${expectedCantrips} trucos para este nivel.`,
      );
    }

    // ── 6. Validate spell count (scaled to initial_level) ──
    const expectedSpells = getSpellsKnownAtLevel(
      cls.name,
      body.initial_level,
      cls.starting_spells_known,
      finalScores,
      cls.spellcasting_ability,
    );
    if (body.spell_selections.length !== expectedSpells) {
      throw new AppError(422,
        `Invalid spell count: expected ${expectedSpells} at level ${body.initial_level}, got ${body.spell_selections.length}`,
        `Debes seleccionar exactamente ${expectedSpells} conjuros para este nivel.`,
      );
    }

    // ── 7. Resolve subclass when unlocked at or before the chosen starting level ──
    let subclassId: string | undefined;
    const subclassUnlockLevel = cls.subclass_level ?? 99;
    if (subclassUnlockLevel <= body.initial_level && !body.subclass_id) {
      throw new AppError(422,
        `Subclass required for ${cls.name} at level ${body.initial_level}.`,
        `Debes seleccionar una subclase para ${cls.name} en nivel ${body.initial_level}.`,
      );
    }
    if (body.subclass_id && subclassUnlockLevel > body.initial_level) {
      throw new AppError(422,
        `Subclass not available until level ${subclassUnlockLevel}.`,
        `Esta clase desbloquea subclase hasta nivel ${subclassUnlockLevel}.`,
      );
    }
    if (body.subclass_id && subclassUnlockLevel <= body.initial_level) {
      const sub = await prisma.subclass.findFirst({
        where: {
          class_id: cls.class_id,
          OR: [
            { subclass_id: body.subclass_id },
            { name: { equals: body.subclass_id, mode: 'insensitive' } },
          ],
        },
      });
      if (!sub) {
        throw new AppError(422,
          `Subclass not found: ${body.subclass_id}`,
          `Subclase no encontrada: ${body.subclass_id}.`,
        );
      }
      subclassId = sub.subclass_id;
    }

    // ── 8. Resolve spell UUIDs for cantrips + starting spells ──
    const resolvedSpellIds: string[] = [];
    const maxSpellLevel = getMaxSpellLevel(cls.name, body.initial_level);
    const selectedSpellKeys = [...body.cantrip_selections, ...body.spell_selections];
    if (new Set(selectedSpellKeys).size !== selectedSpellKeys.length) {
      throw new AppError(422, 'Duplicate spell selections are not allowed.', 'No puedes seleccionar el mismo conjuro dos veces.');
    }
    const spellSelections = [
      ...body.cantrip_selections.map(value => ({ value, expected: 'cantrip' as const })),
      ...body.spell_selections.map(value => ({ value, expected: 'spell' as const })),
    ];
    for (const selection of spellSelections) {
      const nameOrId = selection.value;
      const spell = await prisma.spell.findFirst({
        where: {
          OR: [{ spell_id: nameOrId }, { name: { equals: nameOrId, mode: 'insensitive' } }],
          class_spells: { some: { class_id: cls.class_id } },
        },
      });
      if (!spell) {
        throw new AppError(422, `Spell not found in ${cls.name} list: ${nameOrId}`, `Conjuro no disponible para ${cls.name}: ${nameOrId}.`);
      }
      if (selection.expected === 'cantrip' && spell.level !== 0) {
        throw new AppError(422, `Expected cantrip, got level ${spell.level}: ${nameOrId}`, `${nameOrId} debe ser un truco.`);
      }
      if (selection.expected === 'spell' && (spell.level <= 0 || spell.level > maxSpellLevel)) {
        throw new AppError(422,
          `Spell level ${spell.level} not available at ${cls.name} level ${body.initial_level}: ${nameOrId}`,
          `${nameOrId} no está disponible para ${cls.name} en nivel ${body.initial_level}.`,
        );
      }
      resolvedSpellIds.push(spell.spell_id);
    }

    // ── 9. Compute HP for initial_level ──
    // The wizard can provide the rolled level-1 hit die base. Legacy/API callers
    // without this value keep the previous max-hit-die behavior.
    // CON for HP includes both ASI bonus and racial bonus, but NOT Point Buy base alone
    const finalCon = finalScores.con;
    const conMod = Math.floor((finalCon - 10) / 2);
    const avgPerLevel = Math.floor(cls.hit_die / 2) + 1;
    if (body.hp_roll_base !== undefined && body.hp_roll_base > cls.hit_die) {
      throw new AppError(422,
        `HP roll exceeds class hit die: ${body.hp_roll_base} > d${cls.hit_die}`,
        `El resultado de puntos de golpe no puede superar d${cls.hit_die}.`,
      );
    }
    const levelOneHpBase = body.hp_roll_base ?? cls.hit_die;
    const maxHP = Math.max(1,
      (levelOneHpBase + conMod) +
      (body.initial_level - 1) * (avgPerLevel + conMod),
    );

    // ── 10. Fetch spell slots for initial_level from progression table ──
    // US-111.3: slots must reflect the chosen starting level, not always level 1
    const spellSlots = await prisma.spellSlotProgression.findMany({
      where: { class_id: cls.class_id, class_level: body.initial_level },
    });

    // ── 11. Collect background data ──
    const bgSkills    = (bg.skill_proficiencies as string[]) ?? [];
    const bgLangs     = (bg.language_grants as string[]) ?? [];
    const bgEquipment = (bg.starting_equipment as Array<{ item_name: string; quantity: number }>) ?? [];

    // ── 12. Collect race data ──
    const raceLangs = (race.languages as string[]) ?? [];

    // ── 13. Resolve background + selected class equipment to item UUIDs ──
    const equipmentMap = new Map<string, number>();
    for (const eq of bgEquipment) {
      await addEquipmentByName(equipmentMap, eq.item_name, eq.quantity);
    }
    for (const eq of body.equipment_selections) {
      await addEquipmentById(equipmentMap, eq.item_id, eq.quantity);
    }
    const equipmentToCreate = Array.from(equipmentMap.entries()).map(([item_id, quantity]) => ({ item_id, quantity }));

    // ── 14. Resource pools ──
    // ASI bonuses are added to base scores and included in finalScores for pool calculations
    const resourcePools = getClassResourcePools(cls.name, body.initial_level, finalScores);

    // ── 15. Transactional creation ──
    const created = await prisma.$transaction(async (tx) => {
      // Base character record
      const char = await tx.character.create({
        data: {
          name:          body.name,
          user_id:       authUser?.user_id,
          race_id:       race.race_id,
          background_id: bg.background_id,
          alignment:     (body.alignment ?? 'true_neutral') as any,
          milestone_leveling: body.milestone_leveling,
          // base_* stores Point Buy value + ASI bonus (racial is added at read time)
          base_str: s.str + (asiAdj['str'] ?? 0),
          base_dex: s.dex + (asiAdj['dex'] ?? 0),
          base_con: s.con + (asiAdj['con'] ?? 0),
          base_int: s.int + (asiAdj['int'] ?? 0),
          base_wis: s.wis + (asiAdj['wis'] ?? 0),
          base_cha: s.cha + (asiAdj['cha'] ?? 0),
          current_hp: maxHP,
          level_1_hp_roll: body.hp_roll_base,
          xp: getXPForLevel(body.initial_level),   // US-111.3: XP = minimum for starting level
          personality_traits: body.personality_traits,
          bonds:  body.bonds,
          ideals: body.ideals,
          flaws:  body.flaws,
          background_variant: body.background_variant,
          character_classes: {
            create: {
              class_id:    cls.class_id,
              class_level: body.initial_level,      // US-111: create at chosen level
              is_primary:  true,
              ...(subclassId ? { subclass_id: subclassId } : {}),
            },
          },
          active_state: { create: {} },
        },
      });

      // Skills: background proficiencies (always granted)
      const grantedSkills = new Set<string>();
      for (const skillId of bgSkills) {
        if (!grantedSkills.has(skillId)) {
          grantedSkills.add(skillId);
          await tx.characterSkill.create({
            data: { character_id: char.id, skill_id: skillId, is_proficient: true },
          });
        }
      }
      // Skills: class selections (dedup with bg)
      for (const skillId of body.skill_selections) {
        if (!grantedSkills.has(skillId)) {
          grantedSkills.add(skillId);
          await tx.characterSkill.create({
            data: { character_id: char.id, skill_id: skillId, is_proficient: true },
          });
        }
      }

      // Cantrips + starting spells
      for (const spellId of resolvedSpellIds) {
        await tx.knownSpell.create({
          data: { character_id: char.id, spell_id: spellId, is_prepared: false },
        });
      }

      // Languages: from race
      for (const langName of raceLangs) {
        const lang = await tx.language.findFirst({
          where: { OR: [{ language_id: langName }, { name: { equals: langName, mode: 'insensitive' } }] },
        });
        if (lang) {
          await tx.characterLanguage.upsert({
            where:  { character_id_language_id: { character_id: char.id, language_id: lang.language_id } },
            create: { character_id: char.id, language_id: lang.language_id },
            update: {},
          });
        }
      }
      // Languages: from background
      for (const langName of bgLangs) {
        const lang = await tx.language.findFirst({
          where: { OR: [{ language_id: langName }, { name: { equals: langName, mode: 'insensitive' } }] },
        });
        if (lang) {
          await tx.characterLanguage.upsert({
            where:  { character_id_language_id: { character_id: char.id, language_id: lang.language_id } },
            create: { character_id: char.id, language_id: lang.language_id },
            update: {},
          });
        }
      }

      // Background starting equipment
      for (const eq of equipmentToCreate) {
        try {
          await tx.inventoryItem.create({
            data: { character_id: char.id, item_id: eq.item_id, quantity: eq.quantity },
          });
        } catch { /* skip if item already added (shouldn't happen at creation) */ }
      }

      // Hit dice tracker — US-111.5: max_dice reflects starting level
      await tx.hitDiceTracker.create({
        data: { character_id: char.id, die_type: cls.hit_die, max_dice: body.initial_level, expended_dice: 0 },
      });

      // Spell slot trackers (from progression table)
      for (const slot of spellSlots) {
        await tx.spellSlotTracker.create({
          data: {
            character_id:   char.id,
            class_id:       cls.class_id,
            slot_level:     slot.slot_level,
            max_slots:      slot.max_slots,
            expended_slots: 0,
            slot_source:    slot.slot_source,
          },
        });
      }

      // Class resource pools
      for (const pool of resourcePools) {
        await tx.resourcePool.create({
          data: { character_id: char.id, ...pool },
        });
      }

      return char;
    });

    const result = await findCharacterById(created.id);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

// ─── GET /characters/:id ──────────────────────────────────────────────────────
characterRouter.get('/:id', async (req, res, next) => {
  try {
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    res.json(character);
  } catch (err) { next(err); }
});

// ─── PATCH /characters/:id/image ─────────────────────────────────────────────
// US-118: Persist compressed character image data for the active profile/device.
const CharacterImageSchema = z.object({
  image_data: z.string()
    .regex(/^data:image\/(webp|jpeg|jpg|png);base64,[A-Za-z0-9+/=]+$/)
    .max(1_500_000),
});

characterRouter.patch('/:id/image', async (req, res, next) => {
  try {
    const body = CharacterImageSchema.parse(req.body);
    const character = await (prisma.character as any).update({
      where: { id: req.params['id']! },
      data: { image_data: body.image_data },
      select: { id: true, image_data: true },
    });
    res.json({ message: 'Imagen del personaje guardada.', character });
  } catch (err) { next(err); }
});

// ─── PATCH /characters/:id ────────────────────────────────────────────────────
// US-110: Edit existing character — name, alignment, current_hp, ability scores, level
const EditCharacterSchema = z.object({
  name:       z.string().min(1).optional(),
  alignment:  z.string().optional(),
  current_hp: z.number().int().optional(),
  temp_hp:    z.number().int().nonnegative().optional(),
  level:      z.number().int().min(1).max(20).optional(),
  ability_scores: z.object({
    str: z.number().int(), dex: z.number().int(), con: z.number().int(),
    int: z.number().int(), wis: z.number().int(), cha: z.number().int(),
  }).optional(),
});

characterRouter.patch('/:id', async (req, res, next) => {
  try {
    const body = EditCharacterSchema.parse(req.body);
    const char = await findCharacterById(req.params['id']!);
    if (!char) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');

    const anyChar = char as any;
    const charUpdates: Record<string, any> = {};

    if (body.name !== undefined)       charUpdates['name'] = body.name;
    if (body.alignment !== undefined)  charUpdates['alignment'] = body.alignment;
    if (body.current_hp !== undefined) charUpdates['current_hp'] = body.current_hp;
    if (body.temp_hp !== undefined)    charUpdates['temp_hp'] = body.temp_hp;

    // Ability score update with Point Buy validation
    if (body.ability_scores) {
      const s = body.ability_scores;
      const POINT_BUY_COSTS: Record<number, number> = { 8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9 };
      const totalCost = Object.values(s).reduce((sum, score) => sum + (POINT_BUY_COSTS[score] ?? 999), 0);
      const invalid = Object.values(s).find(score => score < 8 || score > 15);
      if (invalid !== undefined)
        throw new AppError(422, 'Score out of range (8–15).', 'Las puntuaciones deben estar entre 8 y 15 (Point Buy).');
      if (totalCost > 27)
        throw new AppError(422, `Point buy budget exceeded: ${totalCost}/27.`, `Presupuesto de puntos superado: ${totalCost}/27.`);
      charUpdates['base_str'] = s.str; charUpdates['base_dex'] = s.dex; charUpdates['base_con'] = s.con;
      charUpdates['base_int'] = s.int; charUpdates['base_wis'] = s.wis; charUpdates['base_cha'] = s.cha;
    }

    // Level change — US-110.4: recalculate HP, XP, spell slots, resource pools, hit dice
    if (body.level !== undefined) {
      const primaryCC = anyChar.character_classes?.find((cc: any) => cc.is_primary);
      const cls = primaryCC?.class;
      const race = anyChar.race;

      if (!primaryCC || !cls)
        throw new AppError(422, 'Primary class not found.', 'No se encontró la clase principal del personaje.');

      const racialBonuses = (race?.ability_bonuses as Record<string, number>) ?? {};
      const baseScores = body.ability_scores ?? {
        str: anyChar.base_str, dex: anyChar.base_dex, con: anyChar.base_con,
        int: anyChar.base_int, wis: anyChar.base_wis, cha: anyChar.base_cha,
      };
      const finalCon = baseScores.con + (racialBonuses['con'] ?? 0);
      const conMod   = Math.floor((finalCon - 10) / 2);
      const avgPerLv = Math.floor(cls.hit_die / 2) + 1;
      const levelOneHpBase = anyChar.level_1_hp_roll ?? cls.hit_die;
      const newMaxHP  = Math.max(1, (levelOneHpBase + conMod) + (body.level - 1) * (avgPerLv + conMod));

      charUpdates['xp']                = getXPForLevel(body.level);
      charUpdates['level_up_available'] = false;
      // Only set current_hp to new max if not explicitly setting it
      if (body.current_hp === undefined) charUpdates['current_hp'] = newMaxHP;

      await prisma.$transaction(async (tx) => {
        // Update character base fields
        await tx.character.update({ where: { id: req.params['id']! }, data: charUpdates });

        // Update primary class level
        await tx.characterClass.updateMany({
          where: { character_id: req.params['id']!, is_primary: true },
          data:  { class_level: body.level },
        });

        // Update hit dice tracker
        await tx.hitDiceTracker.updateMany({
          where: { character_id: req.params['id']! },
          data:  { max_dice: body.level!, expended_dice: 0 },
        });

        // Regenerate spell slots for new level
        await tx.spellSlotTracker.deleteMany({ where: { character_id: req.params['id']! } });
        const newSlots = await tx.spellSlotProgression.findMany({
          where: { class_id: cls.class_id, class_level: body.level },
        });
        for (const slot of newSlots) {
          await tx.spellSlotTracker.create({
            data: {
              character_id:   req.params['id']!,
              class_id:       cls.class_id,
              slot_level:     slot.slot_level,
              max_slots:      slot.max_slots,
              expended_slots: 0,
              slot_source:    slot.slot_source,
            },
          });
        }

        // Regenerate resource pools for new level
        const finalScores = {
          str: baseScores.str + (racialBonuses['str'] ?? 0),
          dex: baseScores.dex + (racialBonuses['dex'] ?? 0),
          con: baseScores.con + (racialBonuses['con'] ?? 0),
          int: baseScores.int + (racialBonuses['int'] ?? 0),
          wis: baseScores.wis + (racialBonuses['wis'] ?? 0),
          cha: baseScores.cha + (racialBonuses['cha'] ?? 0),
        };
        const newPools = getClassResourcePools(cls.name, body.level!, finalScores);
        await tx.resourcePool.deleteMany({ where: { character_id: req.params['id']! } });
        for (const pool of newPools) {
          await tx.resourcePool.create({
            data: { character_id: req.params['id']!, ...pool },
          });
        }
      });

      const result = await findCharacterById(req.params['id']!);
      return res.json(result);
    }

    // No level change — simple field update
    if (Object.keys(charUpdates).length === 0) return res.json(char);
    await updateCharacter(req.params['id']!, charUpdates);
    const result = await findCharacterById(req.params['id']!);
    res.json(result);
  } catch (err) { next(err); }
});

// ─── GET /characters/:id/hydrated ─────────────────────────────────────────────
// US-106: All derived stats computed server-side via hydrate engine.
characterRouter.get('/:id/hydrated', async (req, res, next) => {
  try {
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');

    // Build the engine input and run all 10 hydration steps at once.
    // This ensures equipped items (armor, shield) correctly affect AC, speed,
    // stealth disadvantage, encumbrance, conditions, etc.
    const raw = buildRawCharacter(character);
    const h   = hydrate(raw);

    // Map HydratedCharacter → legacy response shape expected by the UI
    res.json({
      ...character,
      computed: {
        max_hp:                     h.maxHp,
        total_level:                h.totalLevel,
        proficiency_bonus:          h.proficiencyBonus,
        initiative:                 h.initiativeBonus,
        armor_class:                h.armorClass,
        unarmored_ac:               10 + Math.floor((h.abilityScores.dex - 10) / 2),
        speed:                      h.speed,
        darkvision_radius:          (character as any).race?.darkvision_radius ?? 0,
        passive_perception:         h.passiveChecks.passivePerception,
        passive_investigation:      h.passiveChecks.passiveInvestigation,
        passive_insight:            h.passiveChecks.passiveInsight,
        ability_scores:             h.abilityScores,
        ability_modifiers:          h.abilityModifiers,
        saving_throw_proficiencies: (character as any).character_classes
          ?.find((cc: any) => cc.is_primary)?.class?.saving_throws ?? [],
        saving_throw_bonuses: Object.fromEntries(
          h.skills
            .filter(s => ['str','dex','con','int','wis','cha'].includes(s.skillId))
            .map(s => [s.skillId, s.bonus])
        ),
        skill_bonuses: Object.fromEntries(h.skills.map(s => [s.skillId, s.bonus])),
        spellcasting_ability:  (character as any).character_classes
          ?.find((cc: any) => cc.is_primary)?.class?.spellcasting_ability ?? null,
        spell_save_dc:         raw.spellcastingAbilityScore != null
          ? 8 + h.proficiencyBonus + Math.floor((raw.spellcastingAbilityScore - 10) / 2)
          : 0,
        spell_attack_bonus:    raw.spellcastingAbilityScore != null
          ? h.proficiencyBonus + Math.floor((raw.spellcastingAbilityScore - 10) / 2)
          : 0,
        stealth_disadvantage:  (character as any).inventory_items?.some(
          (inv: any) => inv.is_equipped && inv.item?.stealth_disadvantage
        ) ?? false,
        carried_weight:        h.carriedWeight,
      },
    });
  } catch (err) { next(err); }
});

// ─── PATCH /characters/:id/ability-scores ────────────────────────────────────
characterRouter.patch('/:id/ability-scores', pointBuyGuard, async (req, res, next) => {
  try {
    const { ability_scores: s } = req.body;
    const updated = await updateCharacter(req.params['id']!, {
      base_str: s.str, base_dex: s.dex, base_con: s.con,
      base_int: s.int, base_wis: s.wis, base_cha: s.cha,
    });
    res.json(updated);
  } catch (err) { next(err); }
});

// ─── POST /characters/:id/xp ─────────────────────────────────────────────────
characterRouter.post('/:id/xp', async (req, res, next) => {
  try {
    const { amount } = z.object({ amount: z.number().int().positive() }).parse(req.body);
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');

    const totalLevel = (character as any).character_classes.reduce((s: number, c: any) => s + c.class_level, 0);
    const newXP = addXP(character.xp, amount);
    const levelUp = isLevelUpAvailable(newXP, totalLevel);

    const updated = await updateCharacter(req.params['id']!, { xp: newXP, level_up_available: levelUp });
    res.json({ xp: updated.xp, level_up_available: updated.level_up_available });
  } catch (err) { next(err); }
});

// ─── POST /characters/:id/level-up ───────────────────────────────────────────
characterRouter.post('/:id/level-up', async (req, res, next) => {
  try {
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    if (!character.level_up_available && !character.milestone_leveling) {
      throw new AppError(400,
        'Level up not available — XP threshold not reached.',
        'Aún no has acumulado suficiente experiencia para subir de nivel.',
      );
    }
    const primary = (character as any).character_classes.find((c: any) => c.is_primary);
    if (!primary) throw new AppError(500, 'No primary class found.', 'No se encontró la clase principal.');

    await prisma.characterClass.update({
      where: { character_id_class_id: { character_id: req.params['id']!, class_id: primary.class_id } },
      data: { class_level: { increment: 1 } },
    });
    await updateCharacter(req.params['id']!, { level_up_available: false });
    res.json({ message: '¡Subida de nivel completada!', new_class_level: primary.class_level + 1 });
  } catch (err) { next(err); }
});

// ─── POST /characters/:id/multiclass ─────────────────────────────────────────
characterRouter.post('/:id/multiclass', async (req, res, next) => {
  try {
    const { class_id } = z.object({ class_id: z.string() }).parse(req.body);
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    deadCharacterGuard(character.is_dead);

    const scores = {
      str: character.base_str, dex: character.base_dex, con: character.base_con,
      int: character.base_int, wis: character.base_wis, cha: character.base_cha,
    };
    const validation = validateMulticlassPrerequisites(class_id, scores);
    if (!validation.valid) {
      throw new AppError(422,
        validation.errors.join(' '),
        `No cumples los requisitos para multiclasear en ${class_id}: ${validation.errors.join(' ')}`,
      );
    }

    await prisma.characterClass.create({
      data: { character_id: req.params['id']!, class_id, class_level: 1, is_primary: false },
    });
    res.status(201).json({ message: `Multiclase en ${class_id} añadida correctamente.` });
  } catch (err) { next(err); }
});

// ─── POST /characters/:id/feats ───────────────────────────────────────────────
characterRouter.post('/:id/feats', async (req, res, next) => {
  try {
    const { feat_id } = z.object({ feat_id: z.string() }).parse(req.body);
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    deadCharacterGuard(character.is_dead);

    const alreadyHas = (character as any).character_feats.some((f: any) => f.feat_id === feat_id);
    if (alreadyHas) {
      const feat = await prisma.feat.findUnique({ where: { feat_id } });
      if (!feat?.repeatable) {
        throw new AppError(409,
          `Character already has feat: ${feat_id}.`,
          `El personaje ya posee la dote '${feat_id}' y no puede tomarla de nuevo.`,
        );
      }
    }

    await prisma.characterFeat.create({ data: { character_id: req.params['id']!, feat_id } });
    res.status(201).json({ message: 'Dote asignada correctamente.' });
  } catch (err) { next(err); }
});

// ─── GET /characters/:id/languages ───────────────────────────────────────────
characterRouter.get('/:id/languages', async (req, res, next) => {
  try {
    const langs = await prisma.characterLanguage.findMany({
      where: { character_id: req.params['id']! },
      include: { language: true },
    });
    res.json(langs.map(l => l.language));
  } catch (err) { next(err); }
});

// ─── POST /characters/:id/languages ──────────────────────────────────────────
characterRouter.post('/:id/languages', async (req, res, next) => {
  try {
    const { language_id } = z.object({ language_id: z.string() }).parse(req.body);
    const existing = await prisma.characterLanguage.findUnique({
      where: { character_id_language_id: { character_id: req.params['id']!, language_id } },
    });
    if (existing) {
      throw new AppError(409,
        `Character already knows language: ${language_id}.`,
        `El personaje ya conoce el idioma '${language_id}'.`,
      );
    }
    await prisma.characterLanguage.create({ data: { character_id: req.params['id']!, language_id } });
    res.status(201).json({ message: 'Idioma añadido correctamente.' });
  } catch (err) { next(err); }
});

// ─── GET /characters/:id/skills ───────────────────────────────────────────────
characterRouter.get('/:id/skills', async (req, res, next) => {
  try {
    const skills = await prisma.characterSkill.findMany({
      where: { character_id: req.params['id']! },
    });
    res.json(skills);
  } catch (err) { next(err); }
});

// ─── POST /characters/:id/skills ─────────────────────────────────────────────
characterRouter.post('/:id/skills', async (req, res, next) => {
  try {
    const VALID_SKILLS = Object.keys(SKILL_ABILITY);
    const body = z.object({
      skill_id:      z.string(),
      is_proficient: z.boolean().optional().default(true),
      is_expertise:  z.boolean().optional().default(false),
    }).parse(req.body);

    if (!VALID_SKILLS.includes(body.skill_id)) {
      throw new AppError(422,
        `Invalid skill_id: ${body.skill_id}`,
        `Habilidad no válida: '${body.skill_id}'.`,
      );
    }

    const result = await prisma.characterSkill.upsert({
      where:  { character_id_skill_id: { character_id: req.params['id']!, skill_id: body.skill_id } },
      create: { character_id: req.params['id']!, skill_id: body.skill_id, is_proficient: body.is_proficient, is_expertise: body.is_expertise },
      update: { is_proficient: body.is_proficient, is_expertise: body.is_expertise },
    });
    res.status(201).json(result);
  } catch (err) { next(err); }
});

// ─── DELETE /characters/:id/skills/:skill_id ─────────────────────────────────
characterRouter.delete('/:id/skills/:skill_id', async (req, res, next) => {
  try {
    await prisma.characterSkill.deleteMany({
      where: { character_id: req.params['id']!, skill_id: req.params['skill_id']! },
    });
    res.json({ message: 'Proficiencia de habilidad eliminada.' });
  } catch (err) { next(err); }
});

// ─── GET /characters/:id/known-spells ────────────────────────────────────────
characterRouter.get('/:id/known-spells', async (req, res, next) => {
  try {
    const spells = await prisma.knownSpell.findMany({
      where:   { character_id: req.params['id']! },
      include: { spell: true },
      orderBy: [{ spell: { level: 'asc' } }, { spell: { name: 'asc' } }],
    });
    res.json(spells);
  } catch (err) { next(err); }
});

// ─── POST /characters/:id/known-spells ───────────────────────────────────────
characterRouter.post('/:id/known-spells', async (req, res, next) => {
  try {
    const body = z.object({
      spell_id:    z.string(),
      is_prepared: z.boolean().optional().default(false),
    }).parse(req.body);

    const spell = await prisma.spell.findFirst({
      where: {
        OR: [
          { spell_id: body.spell_id },
          { name: { equals: body.spell_id, mode: 'insensitive' } },
        ],
      },
    });
    if (!spell) {
      throw new AppError(422, `Spell not found: ${body.spell_id}`, `Conjuro no encontrado: '${body.spell_id}'.`);
    }

    const existing = await prisma.knownSpell.findUnique({
      where: { character_id_spell_id: { character_id: req.params['id']!, spell_id: spell.spell_id } },
    });
    if (existing) {
      throw new AppError(409,
        `Character already knows spell: ${spell.name}`,
        `El personaje ya conoce el conjuro '${spell.name}'.`,
      );
    }

    const result = await prisma.knownSpell.create({
      data: { character_id: req.params['id']!, spell_id: spell.spell_id, is_prepared: body.is_prepared },
      include: { spell: true },
    });
    res.status(201).json(result);
  } catch (err) { next(err); }
});

// ─── PATCH /characters/:id/known-spells/:spell_id/prepare ────────────────────
characterRouter.patch('/:id/known-spells/:spell_id/prepare', async (req, res, next) => {
  try {
    const { is_prepared } = z.object({ is_prepared: z.boolean() }).parse(req.body);
    const updated = await prisma.knownSpell.updateMany({
      where: { character_id: req.params['id']!, spell_id: req.params['spell_id']! },
      data:  { is_prepared },
    });
    if (updated.count === 0) {
      throw new AppError(404, 'Known spell not found.', 'El personaje no conoce ese conjuro.');
    }
    res.json({ message: is_prepared ? 'Conjuro preparado.' : 'Conjuro desprepararado.' });
  } catch (err) { next(err); }
});

// ─── DELETE /characters/:id/known-spells/:spell_id ───────────────────────────
characterRouter.delete('/:id/known-spells/:spell_id', async (req, res, next) => {
  try {
    const deleted = await prisma.knownSpell.deleteMany({
      where: { character_id: req.params['id']!, spell_id: req.params['spell_id']! },
    });
    if (deleted.count === 0) {
      throw new AppError(404, 'Known spell not found.', 'El personaje no conoce ese conjuro.');
    }
    res.json({ message: 'Conjuro olvidado.' });
  } catch (err) { next(err); }
});
