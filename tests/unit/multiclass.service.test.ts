// tests/unit/multiclass.service.test.ts
// T-030 | Spec: US-82 (AC 82.1–82.5)

import { validateMulticlassPrerequisites } from '../../src/services/multiclass.service';

const HIGH_SCORES = { str: 15, dex: 15, con: 14, int: 14, wis: 15, cha: 15 };

describe('MulticlassService — validateMulticlassPrerequisites (US-82.1)', () => {
  test('Barbarian: STR 13 required — passes with 15', () => {
    expect(validateMulticlassPrerequisites('barbarian', { ...HIGH_SCORES, str: 13 }).valid).toBe(true);
  });

  test('Barbarian: STR 12 rejected', () => {
    const r = validateMulticlassPrerequisites('barbarian', { ...HIGH_SCORES, str: 12 });
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toMatch(/STR/);
  });

  test('Monk: DEX 13 AND WIS 13 both required', () => {
    expect(validateMulticlassPrerequisites('monk', { ...HIGH_SCORES }).valid).toBe(true);
  });

  test('Monk: rejected if DEX 12 even with WIS 15', () => {
    const r = validateMulticlassPrerequisites('monk', { ...HIGH_SCORES, dex: 12 });
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toMatch(/DEX/);
  });

  test('Fighter: STR 13 OR DEX 13 — passes with only STR 13', () => {
    const r = validateMulticlassPrerequisites('fighter', { ...HIGH_SCORES, str: 13, dex: 8 });
    expect(r.valid).toBe(true);
  });

  test('Fighter: rejected if both STR and DEX < 13', () => {
    const r = validateMulticlassPrerequisites('fighter', { ...HIGH_SCORES, str: 12, dex: 12 });
    expect(r.valid).toBe(false);
  });

  test('Paladin: STR 13 AND CHA 13 both required', () => {
    const r = validateMulticlassPrerequisites('paladin', { ...HIGH_SCORES, str: 12 });
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toMatch(/STR/);
  });

  test('Unknown class returns error', () => {
    const r = validateMulticlassPrerequisites('dragon_rider', HIGH_SCORES);
    expect(r.valid).toBe(false);
  });
});
