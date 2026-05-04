// tests/unit/health.service.test.ts
// T-020 | Spec: FR-03, FR-04, US-82.2

import { calculateMaxHP, applyExhaustionToMaxHP } from '../../src/services/health.service';

describe('HealthService — calculateMaxHP (FR-03, FR-04)', () => {
  test('Level 1 Fighter (d10, CON 14 → +2): HP = 10+2 = 12', () => {
    expect(calculateMaxHP([{ hitDie: 10, classLevel: 1, isPrimary: true }], 14)).toBe(12);
  });

  test('Level 2 Fighter (d10, CON 14): HP = 12 + floor(10/2)+1+2 = 12+8 = 20', () => {
    expect(calculateMaxHP([{ hitDie: 10, classLevel: 2, isPrimary: true }], 14)).toBe(20);
  });

  test('Level 1 Wizard (d6, CON 10 → 0): HP = 6', () => {
    expect(calculateMaxHP([{ hitDie: 6, classLevel: 1, isPrimary: true }], 10)).toBe(6);
  });

  test('minimum 1 HP even with very low CON', () => {
    expect(calculateMaxHP([{ hitDie: 6, classLevel: 1, isPrimary: true }], 1)).toBeGreaterThanOrEqual(1);
  });

  test('Hill Dwarf trait (+1/level) applied over 3 levels', () => {
    const hp = calculateMaxHP(
      [{ hitDie: 8, classLevel: 3, isPrimary: true }],
      10, // CON mod = 0
      [{ hpBonusPerLevel: 1 }],
    );
    // L1: 8, L2: 5, L3: 5 → base 18, + 3 (Hill Dwarf) = 21
    expect(hp).toBe(21);
  });

  test('Multiclass: Fighter 1 (primary, d10) / Wizard 1 (d6), CON 10', () => {
    const hp = calculateMaxHP([
      { hitDie: 10, classLevel: 1, isPrimary: true },
      { hitDie: 6,  classLevel: 1, isPrimary: false },
    ], 10);
    // L1 Fighter: 10, L1 Wizard (multiclass avg): floor(6/2)+1+0 = 4
    expect(hp).toBe(14);
  });
});

describe('HealthService — applyExhaustionToMaxHP (US-81.3)', () => {
  test('exhaustion < 4: no change', () => expect(applyExhaustionToMaxHP(40, 3)).toBe(40));
  test('exhaustion 4: halved (floor)', () => expect(applyExhaustionToMaxHP(40, 4)).toBe(20));
  test('exhaustion 5: still halved', () => expect(applyExhaustionToMaxHP(40, 5)).toBe(20));
  test('odd max HP halved floors down', () => expect(applyExhaustionToMaxHP(41, 4)).toBe(20));
});
