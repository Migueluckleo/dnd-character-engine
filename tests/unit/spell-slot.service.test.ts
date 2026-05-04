// tests/unit/spell-slot.service.test.ts
// T-028 | Spec: US-79 (AC 79.1–79.6), US-82.4

import {
  getCombinedCasterLevel,
  buildSlotTrackerRows,
  expendSlot,
  recoverSlotsOnRest,
} from '../../src/services/spell-slot.service';

describe('SpellSlotService — getCombinedCasterLevel (US-82.4)', () => {
  test('Wizard 3 (full) → caster level 3', () => {
    expect(getCombinedCasterLevel([{ classId: 'wizard', casterType: 'full', classLevel: 3 }])).toBe(3);
  });

  test('Paladin 2 (half) → caster level 1', () => {
    expect(getCombinedCasterLevel([{ classId: 'paladin', casterType: 'half', classLevel: 2 }])).toBe(1);
  });

  test('Fighter 2 (none) → caster level 0', () => {
    expect(getCombinedCasterLevel([{ classId: 'fighter', casterType: 'none', classLevel: 2 }])).toBe(0);
  });

  test('Wizard 3 / Cleric 2 → caster level 5', () => {
    expect(getCombinedCasterLevel([
      { classId: 'wizard', casterType: 'full', classLevel: 3 },
      { classId: 'cleric', casterType: 'full', classLevel: 2 },
    ])).toBe(5);
  });

  test('Bard 3 / Paladin 2 → 3 + floor(2/2) = 4', () => {
    expect(getCombinedCasterLevel([
      { classId: 'bard',   casterType: 'full', classLevel: 3 },
      { classId: 'paladin',casterType: 'half', classLevel: 2 },
    ])).toBe(4);
  });

  test('Warlock (pact magic) excluded from combined level', () => {
    expect(getCombinedCasterLevel([
      { classId: 'warlock', casterType: 'warlock', classLevel: 3 },
      { classId: 'wizard',  casterType: 'full',    classLevel: 2 },
    ])).toBe(2); // only wizard contributes
  });
});

describe('SpellSlotService — expendSlot (US-79.5)', () => {
  const trackers = [
    { classId: 'combined', slotLevel: 1, maxSlots: 4, expendedSlots: 3, slotSource: 'standard' as const },
  ];

  test('expends one slot correctly', () => {
    const result = expendSlot(trackers, 1, 'standard');
    expect(result[0]!.expendedSlots).toBe(4);
  });

  test('throws when no slots available', () => {
    const full = [{ ...trackers[0]!, expendedSlots: 4 }];
    expect(() => expendSlot(full, 1, 'standard')).toThrow(/No available spell slots/);
  });
});

describe('SpellSlotService — recoverSlotsOnRest (US-79.6)', () => {
  const trackers = [
    { classId: 'combined',  slotLevel: 1, maxSlots: 4, expendedSlots: 2, slotSource: 'standard' as const },
    { classId: 'warlock',   slotLevel: 2, maxSlots: 2, expendedSlots: 2, slotSource: 'pact_magic' as const },
  ];

  test('long rest resets standard slots only', () => {
    const result = recoverSlotsOnRest(trackers, 'long_rest');
    expect(result.find(t => t.slotSource === 'standard')!.expendedSlots).toBe(0);
    expect(result.find(t => t.slotSource === 'pact_magic')!.expendedSlots).toBe(2); // unchanged
  });

  test('short rest resets pact magic only (US-79.3)', () => {
    const result = recoverSlotsOnRest(trackers, 'short_rest');
    expect(result.find(t => t.slotSource === 'pact_magic')!.expendedSlots).toBe(0);
    expect(result.find(t => t.slotSource === 'standard')!.expendedSlots).toBe(2); // unchanged
  });
});
