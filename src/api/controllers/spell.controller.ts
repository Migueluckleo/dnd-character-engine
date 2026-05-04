// src/api/controllers/spell.controller.ts
// T-050 | Spec: US-78, US-79, plan.md §5

import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/error-handler';
import { deadCharacterGuard } from '../middleware/guards';
import { expendSlot } from '../../services/spell-slot.service';
import { endConcentration } from '../../services/concentration.service';
import { findCharacterById, updateCharacter, prisma } from '../../repositories/character.repository';

export const spellRouter = Router();

// ─── GET /characters/:id/spell-slots ─────────────────────────────────────────
spellRouter.get('/:id/spell-slots', async (req, res, next) => {
  try {
    const slots = await prisma.spellSlotTracker.findMany({
      where: { character_id: req.params['id']! },
      orderBy: [{ slot_source: 'asc' }, { slot_level: 'asc' }],
    });

    const standard   = slots.filter(s => s.slot_source === 'standard');
    const pact_magic = slots.filter(s => s.slot_source === 'pact_magic');

    res.json({
      standard_slots:    standard.map(s => ({
        slot_level: s.slot_level, max: s.max_slots,
        expended: s.expended_slots, available: s.max_slots - s.expended_slots,
      })),
      pact_magic_slots: pact_magic.map(s => ({
        slot_level: s.slot_level, max: s.max_slots,
        expended: s.expended_slots, available: s.max_slots - s.expended_slots,
      })),
    });
  } catch (err) { next(err); }
});

// ─── POST /characters/:id/cast ────────────────────────────────────────────────
spellRouter.post('/:id/cast', async (req, res, next) => {
  try {
    const { known_spell_id, slot_level, slot_source } = z.object({
      known_spell_id: z.string(),
      slot_level:     z.number().int().min(0).max(9),
      slot_source:    z.enum(['standard', 'pact_magic']).default('standard'),
    }).parse(req.body);

    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    deadCharacterGuard(character.is_dead);

    // Verify the spell belongs to this character
    const knownSpell = character.known_spells.find(ks => ks.id === known_spell_id);
    if (!knownSpell) {
      throw new AppError(404, 'Known spell not found.', 'El conjuro no está en la lista de conjuros del personaje.');
    }

    // Expend slot (throws if none available — US-79.5)
    const currentTrackers = character.spell_slot_trackers.map(t => ({
      classId: t.class_id, slotLevel: t.slot_level, maxSlots: t.max_slots,
      expendedSlots: t.expended_slots, slotSource: t.slot_source as 'standard' | 'pact_magic',
    }));

    let newTrackers;
    try {
      newTrackers = expendSlot(currentTrackers, slot_level, slot_source);
    } catch {
      throw new AppError(422,
        `No available spell slots at level ${slot_level}.`,
        `No tienes espacios de conjuro disponibles de nivel ${slot_level}.`,
      );
    }

    // Persist updated slots
    for (const t of newTrackers) {
      await prisma.spellSlotTracker.updateMany({
        where: { character_id: req.params['id']!, slot_level: t.slotLevel, slot_source: t.slotSource as any },
        data:  { expended_slots: t.expendedSlots },
      });
    }

    // Handle concentration (US-78.1): auto-clear previous, set new
    let previousConcentrationEnded = false;
    if (knownSpell.spell.requires_concentration) {
      previousConcentrationEnded = !!character.active_concentration_spell_id;
      await updateCharacter(req.params['id']!, { active_concentration_spell_id: known_spell_id });
    }

    res.json({
      cast: knownSpell.spell.name,
      slot_level,
      requires_concentration: knownSpell.spell.requires_concentration,
      previous_concentration_ended: previousConcentrationEnded,
    });
  } catch (err) { next(err); }
});

// ─── DELETE /characters/:id/concentration ─────────────────────────────────────
spellRouter.delete('/:id/concentration', async (req, res, next) => {
  try {
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');

    if (!character.active_concentration_spell_id) {
      throw new AppError(400,
        'Character is not concentrating on any spell.',
        'El personaje no está concentrado en ningún conjuro.',
      );
    }

    await updateCharacter(req.params['id']!, { active_concentration_spell_id: endConcentration() });
    res.json({ message: 'Concentración terminada.' });
  } catch (err) { next(err); }
});
