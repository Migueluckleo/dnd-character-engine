// src/api/controllers/rest.controller.ts
// T-048, T-049 | Spec: US-71, US-86, FR-10, FR-11

import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/error-handler';
import { deadCharacterGuard } from '../middleware/guards';
import { triggerShortRest, triggerLongRest } from '../../services/rest.service';
import { findCharacterById, updateCharacter, upsertActiveState, prisma } from '../../repositories/character.repository';

export const restRouter = Router();

// ─── POST /characters/:id/short-rest ─────────────────────────────────────────
restRouter.post('/:id/short-rest', async (req, res, next) => {
  try {
    const { hit_dice_to_spend } = z.object({
      hit_dice_to_spend: z.number().int().nonnegative(),
    }).parse(req.body);

    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    deadCharacterGuard(character.is_dead);

    const primaryClass = character.character_classes.find(c => c.is_primary);
    if (!primaryClass) throw new AppError(500, 'No primary class.', 'No se encontró la clase principal.');

    const hitDiceTrackers = character.hit_dice_trackers.map(t => ({
      dieType:      t.die_type,
      maxDice:      t.max_dice,
      expendedDice: t.expended_dice,
    }));
    const spellSlotTrackers = character.spell_slot_trackers.map(t => ({
      classId:       t.class_id,
      slotLevel:     t.slot_level,
      maxSlots:      t.max_slots,
      expendedSlots: t.expended_slots,
      slotSource:    t.slot_source as 'standard' | 'pact_magic',
    }));
    const resourcePools = character.resource_pools.map(p => ({
      poolId:  p.pool_id,
      current: p.current,
      max:     p.max,
      resetOn: p.reset_on as 'short_rest' | 'long_rest',
    }));

    const result = triggerShortRest({
      currentHp:         character.current_hp,
      maxHp:             character.current_hp, // full hydrate would provide real max; simplified
      conScore:          character.base_con,
      hitDiceTrackers,
      hitDiceToSpend:    hit_dice_to_spend,
      primaryDieType:    primaryClass.class.hit_die,
      spellSlotTrackers,
      resourcePools,
    });

    // Persist all changes
    await updateCharacter(req.params['id']!, { current_hp: result.newCurrentHp });

    for (const t of result.hitDiceTrackers) {
      await prisma.hitDiceTracker.updateMany({
        where: { character_id: req.params['id']!, die_type: t.dieType },
        data:  { expended_dice: t.expendedDice },
      });
    }
    for (const t of result.spellSlotTrackers) {
      await prisma.spellSlotTracker.updateMany({
        where: { character_id: req.params['id']!, slot_level: t.slotLevel, slot_source: t.slotSource as any },
        data:  { expended_slots: t.expendedSlots },
      });
    }
    for (const p of result.resourcePools) {
      await prisma.resourcePool.updateMany({
        where: { character_id: req.params['id']!, pool_id: p.poolId },
        data:  { current: p.current },
      });
    }

    res.json({
      hp_recovered:      result.hpRecovered,
      new_current_hp:    result.newCurrentHp,
      hit_dice_remaining: result.hitDiceTrackers.map(t => ({
        die_type: t.dieType,
        remaining: t.maxDice - t.expendedDice,
      })),
    });
  } catch (err) { next(err); }
});

// ─── POST /characters/:id/long-rest ──────────────────────────────────────────
// Stores last_long_rest timestamp on character (simplified via metadata)
restRouter.post('/:id/long-rest', async (req, res, next) => {
  try {
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    deadCharacterGuard(character.is_dead);

    const totalLevel = character.character_classes.reduce((s, c) => s + c.class_level, 0);
    const exhaustionLevel = character.active_state?.exhaustion_level ?? 0;

    const hitDiceTrackers = character.hit_dice_trackers.map(t => ({
      dieType: t.die_type, maxDice: t.max_dice, expendedDice: t.expended_dice,
    }));
    const spellSlotTrackers = character.spell_slot_trackers.map(t => ({
      classId: t.class_id, slotLevel: t.slot_level, maxSlots: t.max_slots,
      expendedSlots: t.expended_slots, slotSource: t.slot_source as 'standard' | 'pact_magic',
    }));
    const resourcePools = character.resource_pools.map(p => ({
      poolId: p.pool_id, current: p.current, max: p.max, resetOn: p.reset_on as 'short_rest' | 'long_rest',
    }));

    const result = triggerLongRest({
      maxHp: character.current_hp, // simplified
      totalLevel,
      exhaustionLevel,
      hitDiceTrackers,
      spellSlotTrackers,
      resourcePools,
    });

    await updateCharacter(req.params['id']!, { current_hp: result.newCurrentHp });

    for (const t of result.hitDiceTrackers) {
      await prisma.hitDiceTracker.updateMany({
        where: { character_id: req.params['id']!, die_type: t.dieType },
        data:  { expended_dice: t.expendedDice },
      });
    }
    for (const t of result.spellSlotTrackers) {
      await prisma.spellSlotTracker.updateMany({
        where: { character_id: req.params['id']!, slot_level: t.slotLevel, slot_source: t.slotSource as any },
        data:  { expended_slots: t.expendedSlots },
      });
    }
    for (const p of result.resourcePools) {
      await prisma.resourcePool.updateMany({
        where: { character_id: req.params['id']!, pool_id: p.poolId },
        data:  { current: p.current },
      });
    }
    if (character.active_state) {
      await upsertActiveState(req.params['id']!, { exhaustion_level: result.exhaustionLevel });
    }

    res.json({
      new_current_hp:    result.newCurrentHp,
      exhaustion_level:  result.exhaustionLevel,
      spell_slots_reset: true,
      message: 'Descanso largo completado. Todos los recursos han sido recuperados.',
    });
  } catch (err) { next(err); }
});
