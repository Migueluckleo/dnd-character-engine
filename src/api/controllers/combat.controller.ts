// src/api/controllers/combat.controller.ts
// T-041, T-042, T-043, T-044, T-045 | Spec: US-70–US-74, US-87

import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/error-handler';
import { deadCharacterGuard } from '../middleware/guards';
import { applyDamage, processDeathSave, setTempHP, resetDeathSaves } from '../../services/combat-state.service';
import { getInitiativeBonus } from '../../services/initiative.service';
import { getModifier, getProficiencyBonus } from '../../services/math.service';
import { findCharacterById, updateCharacter, upsertActiveState } from '../../repositories/character.repository';

export const combatRouter = Router();

function calculateCharacterMaxHp(character: any): number {
  const racialBonuses = (character.race?.ability_bonuses as Record<string, number>) ?? {};
  const conScore = character.base_con + (racialBonuses['con'] ?? 0);
  const conMod = getModifier(conScore);
  let maxHp = 0;

  for (const cc of character.character_classes ?? []) {
    const hitDie = cc.class?.hit_die ?? 8;
    const avg = Math.floor(hitDie / 2) + 1;
    if (cc.is_primary) {
      maxHp += ((character as any).level_1_hp_roll ?? hitDie) + conMod;
      maxHp += Math.max(0, cc.class_level - 1) * Math.max(1, avg + conMod);
    } else {
      maxHp += cc.class_level * Math.max(1, avg + conMod);
    }
  }

  return Math.max(1, maxHp);
}

// ─── POST /characters/:id/damage ─────────────────────────────────────────────
combatRouter.post('/:id/damage', async (req, res, next) => {
  try {
    const { damage } = z.object({ damage: z.number().int().positive() }).parse(req.body);
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    deadCharacterGuard(character.is_dead);

    const maxHp = calculateCharacterMaxHp(character);

    const result = applyDamage({
      currentHp: character.current_hp,
      tempHp: character.temp_hp,
      maxHp,
      damage,
      isConcentrating: !!character.active_concentration_spell_id,
    });

    await updateCharacter(req.params['id']!, {
      current_hp: result.currentHp,
      temp_hp: result.tempHp,
      is_dead: result.isDead,
      ...(result.isDead ? { active_concentration_spell_id: null } : {}),
    });

    if (result.deathSaveTriggered) {
      await upsertActiveState(req.params['id']!, { is_unconscious: true });
    }

    res.json({
      current_hp: result.currentHp,
      temp_hp: result.tempHp,
      is_dead: result.isDead,
      death_save_triggered: result.deathSaveTriggered,
      concentration_save_dc: result.concentrationSaveDC,
    });
  } catch (err) { next(err); }
});

// ─── POST /characters/:id/heal ────────────────────────────────────────────────
combatRouter.post('/:id/heal', async (req, res, next) => {
  try {
    const { amount } = z.object({ amount: z.number().int().positive() }).parse(req.body);
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    if (character.is_dead) {
      throw new AppError(422, 'Cannot heal a dead character.', 'No se puede curar a un personaje muerto.');
    }

    const maxHp = calculateCharacterMaxHp(character);
    const newHp = Math.min(maxHp, character.current_hp + amount);
    const resetSaves = newHp > 0 && character.current_hp === 0;

    await updateCharacter(req.params['id']!, {
      current_hp: newHp,
      ...(resetSaves ? { death_saves_success: 0, death_saves_fail: 0 } : {}),
    });

    if (resetSaves) await upsertActiveState(req.params['id']!, { is_unconscious: false });

    res.json({ current_hp: newHp, death_saves_reset: resetSaves });
  } catch (err) { next(err); }
});

// ─── POST /characters/:id/current-hp ─────────────────────────────────────────
combatRouter.post('/:id/current-hp', async (req, res, next) => {
  try {
    const { amount } = z.object({ amount: z.number().int().nonnegative() }).parse(req.body);
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    if (character.is_dead && amount > 0) {
      throw new AppError(422, 'Cannot restore a dead character this way.', 'No se puede restaurar a un personaje muerto desde este ajuste.');
    }

    const maxHp = calculateCharacterMaxHp(character);
    const newHp = Math.min(maxHp, amount);
    const resetSaves = newHp > 0 && character.current_hp === 0;

    await updateCharacter(req.params['id']!, {
      current_hp: newHp,
      ...(resetSaves ? { death_saves_success: 0, death_saves_fail: 0 } : {}),
    });

    if (resetSaves) await upsertActiveState(req.params['id']!, { is_unconscious: false });

    res.json({ current_hp: newHp, max_hp: maxHp, death_saves_reset: resetSaves });
  } catch (err) { next(err); }
});

// ─── POST /characters/:id/death-save ─────────────────────────────────────────
combatRouter.post('/:id/death-save', async (req, res, next) => {
  try {
    const { roll } = z.object({ roll: z.number().int().min(1).max(20) }).parse(req.body);
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');

    if (character.current_hp > 0) {
      throw new AppError(400,
        'Death saves only apply at 0 HP.',
        'Las Tiradas de Salvación de Muerte solo aplican cuando los PG son 0.',
      );
    }

    const result = processDeathSave(character.death_saves_success, character.death_saves_fail, roll);

    await updateCharacter(req.params['id']!, {
      death_saves_success: result.successes,
      death_saves_fail:    result.failures,
      is_dead:             result.isDead,
      ...(result.regainedHP ? { current_hp: result.regainedHP } : {}),
    });

    res.json(result);
  } catch (err) { next(err); }
});

// ─── POST /characters/:id/temp-hp ────────────────────────────────────────────
combatRouter.post('/:id/temp-hp', async (req, res, next) => {
  try {
    const { amount } = z.object({ amount: z.number().int().nonnegative() }).parse(req.body);
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');

    const newTempHp = amount === 0 ? 0 : setTempHP(character.temp_hp, amount);
    await updateCharacter(req.params['id']!, { temp_hp: newTempHp });

    res.json({ temp_hp: newTempHp, replaced: newTempHp !== character.temp_hp });
  } catch (err) { next(err); }
});

// ─── GET /characters/:id/initiative ──────────────────────────────────────────
combatRouter.get('/:id/initiative', async (req, res, next) => {
  try {
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');

    const totalLevel = character.character_classes.reduce((s, c) => s + c.class_level, 0);
    const hasJack = character.character_traits.some(t => t.trait.name === 'Jack of All Trades');
    const hasAlert = character.character_feats.some(f => f.feat_id === 'alert');

    const result = getInitiativeBonus({
      dexScore: character.base_dex,
      totalLevel,
      hasJackOfAllTrades: hasJack,
      hasAlertFeat: hasAlert,
    });

    res.json({ ...result, roll_formula: `1d20 + ${result.initiativeBonus}` });
  } catch (err) { next(err); }
});

// ─── PATCH /characters/:id/reaction ──────────────────────────────────────────
combatRouter.patch('/:id/reaction', async (req, res, next) => {
  try {
    const { reaction_available } = z.object({ reaction_available: z.boolean() }).parse(req.body);
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');

    const state = character.active_state;
    if (!reaction_available && state && !state.reaction_available) {
      throw new AppError(422,
        'Reaction already spent this turn.',
        'La reacción ya fue gastada en este turno.',
      );
    }

    await upsertActiveState(req.params['id']!, { reaction_available });
    res.json({ reaction_available });
  } catch (err) { next(err); }
});
