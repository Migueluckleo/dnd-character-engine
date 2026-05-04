// tests/unit/math.service.test.ts
// T-018 | Spec: FR-01, FR-05

import { getModifier, getProficiencyBonus, getHalfProficiencyBonus } from '../../src/services/math.service';

describe('MathService — getModifier (FR-01)', () => {
  test('score 10 → modifier 0', () => expect(getModifier(10)).toBe(0));
  test('score 11 → modifier 0 (floor)', () => expect(getModifier(11)).toBe(0));
  test('score 12 → modifier +1', () => expect(getModifier(12)).toBe(1));
  test('score 8 → modifier -1', () => expect(getModifier(8)).toBe(-1));
  test('score 9 → modifier -1 (floor)', () => expect(getModifier(9)).toBe(-1));
  test('score 20 → modifier +5', () => expect(getModifier(20)).toBe(5));
  test('score 1 → modifier -5 (floor)', () => expect(getModifier(1)).toBe(-5));
  test('score 15 → modifier +2', () => expect(getModifier(15)).toBe(2));
});

describe('MathService — getProficiencyBonus (FR-05)', () => {
  test('level 1 → +2',  () => expect(getProficiencyBonus(1)).toBe(2));
  test('level 4 → +2',  () => expect(getProficiencyBonus(4)).toBe(2));
  test('level 5 → +3',  () => expect(getProficiencyBonus(5)).toBe(3));
  test('level 8 → +3',  () => expect(getProficiencyBonus(8)).toBe(3));
  test('level 9 → +4',  () => expect(getProficiencyBonus(9)).toBe(4));
  test('level 13 → +5', () => expect(getProficiencyBonus(13)).toBe(5));
  test('level 17 → +6', () => expect(getProficiencyBonus(17)).toBe(6));
  test('level 20 → +6', () => expect(getProficiencyBonus(20)).toBe(6));
  test('invalid level throws', () => expect(() => getProficiencyBonus(0)).toThrow());
});

describe('MathService — getHalfProficiencyBonus (US-27.4)', () => {
  test('level 1 — half of +2 = 1', () => expect(getHalfProficiencyBonus(1)).toBe(1));
  test('level 5 — half of +3 = 1 (floor)', () => expect(getHalfProficiencyBonus(5)).toBe(1));
  test('level 9 — half of +4 = 2', () => expect(getHalfProficiencyBonus(9)).toBe(2));
});
