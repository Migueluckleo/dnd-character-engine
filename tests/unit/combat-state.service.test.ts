// tests/unit/combat-state.service.test.ts
// T-025 | Spec: US-70 (AC 70.1–70.8), US-72 (AC 72.1–72.3), US-73 (AC 73.1–73.4)

import {
  processDeathSave,
  applyDamage,
  setTempHP,
  resetDeathSaves,
} from '../../src/services/combat-state.service';

describe('CombatStateService — processDeathSave (US-70)', () => {
  test('roll 10–19: adds 1 success', () => {
    const r = processDeathSave(0, 0, 15);
    expect(r.successes).toBe(1);
    expect(r.failures).toBe(0);
    expect(r.isDead).toBe(false);
    expect(r.isStable).toBe(false);
  });

  test('roll 2–9: adds 1 failure', () => {
    const r = processDeathSave(0, 0, 5);
    expect(r.failures).toBe(1);
    expect(r.successes).toBe(0);
  });

  test('natural 1: adds 2 failures (AC 70.6)', () => {
    const r = processDeathSave(0, 0, 1);
    expect(r.failures).toBe(2);
  });

  test('natural 20: regains 1 HP, resets counters (AC 70.5)', () => {
    const r = processDeathSave(1, 1, 20);
    expect(r.regainedHP).toBe(1);
    expect(r.successes).toBe(0);
    expect(r.failures).toBe(0);
    expect(r.isDead).toBe(false);
  });

  test('3 successes → stable (AC 70.3)', () => {
    const r = processDeathSave(2, 0, 15);
    expect(r.isStable).toBe(true);
    expect(r.isDead).toBe(false);
  });

  test('3 failures → dead (AC 70.4)', () => {
    const r = processDeathSave(0, 2, 5);
    expect(r.isDead).toBe(true);
    expect(r.isStable).toBe(false);
  });

  test('natural 1 at 2 failures → dead (2+2=4 capped at 3)', () => {
    const r = processDeathSave(0, 2, 1);
    expect(r.isDead).toBe(true);
  });
});

describe('CombatStateService — applyDamage (US-72, US-73)', () => {
  test('temp HP absorbs damage first (AC 73.1)', () => {
    const r = applyDamage({ currentHp: 10, tempHp: 5, maxHp: 20, damage: 3, isConcentrating: false });
    expect(r.tempHp).toBe(2);
    expect(r.currentHp).toBe(10);
  });

  test('overflow past temp HP hits current HP', () => {
    const r = applyDamage({ currentHp: 10, tempHp: 3, maxHp: 20, damage: 8, isConcentrating: false });
    expect(r.tempHp).toBe(0);
    expect(r.currentHp).toBe(5);
  });

  test('instant death: damage >= current_hp + max_hp (AC 72.3)', () => {
    // currentHp=5, maxHp=15 → threshold=20, damage=20 → instant death
    const r = applyDamage({ currentHp: 5, tempHp: 0, maxHp: 15, damage: 20, isConcentrating: false });
    expect(r.isDead).toBe(true);
  });

  test('not instant death if damage < threshold', () => {
    const r = applyDamage({ currentHp: 5, tempHp: 0, maxHp: 15, damage: 19, isConcentrating: false });
    expect(r.isDead).toBe(false);
  });

  test('concentration save DC = max(10, floor(damage/2)) (AC 78.3)', () => {
    const r = applyDamage({ currentHp: 20, tempHp: 0, maxHp: 20, damage: 18, isConcentrating: true });
    expect(r.concentrationSaveDC).toBe(10);
  });

  test('concentration DC minimum is 10 for low damage (AC 78.3)', () => {
    const r = applyDamage({ currentHp: 20, tempHp: 0, maxHp: 20, damage: 4, isConcentrating: true });
    expect(r.concentrationSaveDC).toBe(10);
  });

  test('no concentration DC if not concentrating', () => {
    const r = applyDamage({ currentHp: 20, tempHp: 0, maxHp: 20, damage: 10, isConcentrating: false });
    expect(r.concentrationSaveDC).toBeNull();
  });

  test('death save triggered when HP and temp HP reach 0', () => {
    const r = applyDamage({ currentHp: 5, tempHp: 0, maxHp: 20, damage: 5, isConcentrating: false });
    expect(r.currentHp).toBe(0);
    expect(r.deathSaveTriggered).toBe(true);
  });
});

describe('CombatStateService — setTempHP (US-73.2)', () => {
  test('higher value replaces current temp HP', () => expect(setTempHP(5, 7)).toBe(7));
  test('lower value does NOT replace (no-stack rule)', () => expect(setTempHP(5, 3)).toBe(5));
  test('equal value does not replace', () => expect(setTempHP(5, 5)).toBe(5));
});

describe('CombatStateService — resetDeathSaves (US-70.7)', () => {
  test('resets both counters to 0', () => {
    const r = resetDeathSaves();
    expect(r.successes).toBe(0);
    expect(r.failures).toBe(0);
  });
});
