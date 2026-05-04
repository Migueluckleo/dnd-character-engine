// tests/unit/ability-score.service.test.ts
// T-019 | Spec: US-85 (AC 85.1–85.5), US-01, FR-06

import { validatePointBuy, applyRacialBonuses, getPointCost } from '../../src/services/ability-score.service';

const VALID_BASE: Parameters<typeof validatePointBuy>[0] = {
  str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8,
  // cost: 9+7+5+4+2+0 = 27 ✓
};

describe('AbilityScoreService — validatePointBuy (US-85)', () => {
  test('valid 27-point build is accepted', () => {
    expect(validatePointBuy(VALID_BASE).valid).toBe(true);
  });

  test('budget of 28 is rejected (AC 85.2)', () => {
    const over = { ...VALID_BASE, str: 15, dex: 15 }; // 9+9+5+4+2+0 = 29
    expect(validatePointBuy(over).valid).toBe(false);
  });

  test('score of 7 is rejected (AC 85.3)', () => {
    const result = validatePointBuy({ ...VALID_BASE, cha: 7 });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/minimum is 8/);
  });

  test('score of 16 is rejected (AC 85.4)', () => {
    const result = validatePointBuy({ ...VALID_BASE, str: 16 });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/maximum via Point Buy is 15/);
  });

  test('cost table: score 14 costs 7 points', () => expect(getPointCost(14)).toBe(7));
  test('cost table: score 15 costs 9 points', () => expect(getPointCost(15)).toBe(9));
  test('cost table: score 8 costs 0 points',  () => expect(getPointCost(8)).toBe(0));
});

describe('AbilityScoreService — applyRacialBonuses (US-85.5, FR-06)', () => {
  test('adds racial bonuses correctly', () => {
    const result = applyRacialBonuses(
      { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      { str: 2, cha: 1 },
    );
    expect(result.str).toBe(17);
    expect(result.cha).toBe(9);
    expect(result.dex).toBe(14); // unchanged
  });

  test('score is capped at 20 (FR-06)', () => {
    const result = applyRacialBonuses(
      { str: 20, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
      { str: 5 },
    );
    expect(result.str).toBe(20);
  });

  test('score floor is 1 (FR-06)', () => {
    const result = applyRacialBonuses(
      { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
      { str: -10 },
    );
    expect(result.str).toBe(1);
  });
});
