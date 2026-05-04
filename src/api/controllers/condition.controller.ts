// src/api/controllers/condition.controller.ts
// T-046, T-047 | Spec: US-80, US-81

import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/error-handler';
import { conditionGuard, deadCharacterGuard } from '../middleware/guards';
import { applyCondition, removeCondition, incrementExhaustion, decrementExhaustion } from '../../services/condition.service';
import { findCharacterById, updateCharacter, upsertActiveState } from '../../repositories/character.repository';
import type { ActiveStateRecord } from '../../services/condition.service';

export const conditionRouter = Router();

function stateToDb(s: ActiveStateRecord) {
  return {
    exhaustion_level:   s.exhaustionLevel,
    reaction_available: s.reactionAvailable,
    is_blinded:         s.isBlinded,   is_charmed:       s.isCharmed,
    is_deafened:        s.isDeafened,  is_frightened:    s.isFrightened,
    is_grappled:        s.isGrappled,  is_incapacitated: s.isIncapacitated,
    is_invisible:       s.isInvisible, is_paralyzed:     s.isParalyzed,
    is_petrified:       s.isPetrified, is_poisoned:      s.isPoisoned,
    is_prone:           s.isProne,     is_restrained:    s.isRestrained,
    is_stunned:         s.isStunned,   is_unconscious:   s.isUnconscious,
  };
}

type CharacterRow = NonNullable<Awaited<ReturnType<typeof findCharacterById>>>;
function dbToState(s: NonNullable<CharacterRow['active_state']>): ActiveStateRecord {
  return {
    exhaustionLevel:   s.exhaustion_level,
    reactionAvailable: s.reaction_available,
    isBlinded:   s.is_blinded,   isCharmed:      s.is_charmed,
    isDeafened:  s.is_deafened,  isFrightened:   s.is_frightened,
    isGrappled:  s.is_grappled,  isIncapacitated:s.is_incapacitated,
    isInvisible: s.is_invisible, isParalyzed:    s.is_paralyzed,
    isPetrified: s.is_petrified, isPoisoned:     s.is_poisoned,
    isProne:     s.is_prone,     isRestrained:   s.is_restrained,
    isStunned:   s.is_stunned,   isUnconscious:  s.is_unconscious,
  };
}

// ─── POST /characters/:id/conditions/:condition_id ────────────────────────────
conditionRouter.post('/:id/conditions/:condition_id', conditionGuard, async (req, res, next) => {
  try {
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    deadCharacterGuard(character.is_dead);

    const state = character.active_state;
    if (!state) throw new AppError(500, 'ActiveState missing.', 'Estado activo no encontrado.');

    const newState = applyCondition(dbToState(state), req.params['condition_id'] as any);
    await upsertActiveState(req.params['id']!, stateToDb(newState));
    res.json(newState);
  } catch (err) { next(err); }
});

// ─── DELETE /characters/:id/conditions/:condition_id ─────────────────────────
conditionRouter.delete('/:id/conditions/:condition_id', conditionGuard, async (req, res, next) => {
  try {
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');

    const state = character.active_state;
    if (!state) throw new AppError(500, 'ActiveState missing.', 'Estado activo no encontrado.');

    const newState = removeCondition(dbToState(state), req.params['condition_id'] as any);
    await upsertActiveState(req.params['id']!, stateToDb(newState));
    res.json(newState);
  } catch (err) { next(err); }
});

// ─── PATCH /characters/:id/exhaustion ────────────────────────────────────────
conditionRouter.patch('/:id/exhaustion', async (req, res, next) => {
  try {
    const { delta } = z.object({ delta: z.union([z.literal(1), z.literal(-1)]) }).parse(req.body);
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');

    const state = character.active_state;
    if (!state) throw new AppError(500, 'ActiveState missing.', 'Estado activo no encontrado.');

    let newState: ActiveStateRecord;
    let characterDied = false;

    if (delta === 1) {
      const result = incrementExhaustion(dbToState(state));
      newState = result.newState;
      characterDied = result.characterDied;
    } else {
      try {
        newState = decrementExhaustion(dbToState(state));
      } catch {
        throw new AppError(400,
          'Exhaustion already at 0.',
          'El nivel de agotamiento ya es 0, no puede reducirse más.',
        );
      }
    }

    await upsertActiveState(req.params['id']!, stateToDb(newState));
    if (characterDied) await updateCharacter(req.params['id']!, { is_dead: true });

    res.json({ exhaustion_level: newState.exhaustionLevel, character_died: characterDied });
  } catch (err) { next(err); }
});
