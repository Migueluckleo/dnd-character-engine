// src/api/middleware/guards.ts
// T-052 to T-056 | Spec: US-77.3, US-85, US-62.2, US-78.1, US-70.4

import type { Request, Response, NextFunction } from 'express';
import { validatePointBuy } from '../../services/ability-score.service';
import { validateSkillId } from '../../services/skill.service';
import { validateConditionId } from '../../services/condition.service';
import { AppError } from './error-handler';
import { MAX_ATTUNED } from '../../services/inventory.service';

/** T-052: Point Buy Guard — applied to POST /characters and PATCH ability-scores */
export function pointBuyGuard(req: Request, _res: Response, next: NextFunction): void {
  const scores = req.body?.ability_scores;
  if (!scores) return next();

  const result = validatePointBuy(scores);
  if (!result.valid) {
    const first = result.errors[0] ?? 'Error de puntos de compra.';
    throw new AppError(422, first, traducirErrorPuntosCompra(first));
  }
  next();
}

function traducirErrorPuntosCompra(msg: string): string {
  if (msg.includes('minimum is 8'))
    return 'Ninguna característica puede ser menor a 8 al usar Compra de Puntos.';
  if (msg.includes('maximum via Point Buy is 15'))
    return 'Ninguna característica puede superar 15 al usar Compra de Puntos (los bonos raciales se aplican después).';
  if (msg.includes('budget is 27'))
    return 'El costo total de características supera el límite de 27 puntos.';
  return 'Error de validación en la Compra de Puntos.';
}

/** T-053: Skill Selection Guard — applied to CharacterSkill mutations */
export function skillSelectionGuard(req: Request, _res: Response, next: NextFunction): void {
  const skillId = req.body?.skill_id ?? req.params['skill_id'];
  if (skillId && !validateSkillId(skillId)) {
    throw new AppError(
      422,
      `Invalid skill_id: '${skillId}' is not in the 18-skill catalog.`,
      `La habilidad '${skillId}' no existe en el catálogo oficial de 18 habilidades.`,
    );
  }
  next();
}

/** T-054: Attunement Guard — applied to PATCH inventory/:item_id when is_attuned=true */
export function attunementGuard(currentAttunedCount: number): void {
  if (currentAttunedCount >= MAX_ATTUNED) {
    throw new AppError(
      422,
      `Attunement limit reached: already ${currentAttunedCount}/${MAX_ATTUNED} items attuned.`,
      `No puedes sintonizarte con más de ${MAX_ATTUNED} objetos a la vez.`,
    );
  }
}

/** T-055: Concentration Guard — auto-clears previous spell, does NOT reject */
export function concentrationNote(): { previousConcentrationEnded: boolean } {
  // Caller sets active_concentration_spell_id; this function signals the response body
  return { previousConcentrationEnded: true };
}

/** T-056: Dead Character Guard — applied to all action endpoints except GET and /heal */
export function deadCharacterGuard(isDead: boolean): void {
  if (isDead) {
    throw new AppError(
      422,
      'Action rejected: character is dead.',
      'El personaje ha muerto y no puede realizar acciones.',
    );
  }
}

/** Validate condition_id middleware helper */
export function conditionGuard(req: Request, _res: Response, next: NextFunction): void {
  const conditionId = req.params['condition_id'];
  if (conditionId && !validateConditionId(conditionId)) {
    throw new AppError(
      422,
      `Invalid condition_id: '${conditionId}'.`,
      `La condición '${conditionId}' no existe en el catálogo oficial.`,
    );
  }
  next();
}
