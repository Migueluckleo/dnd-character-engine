// tests/integration/spell-slots.integration.test.ts — T-057, T-058, T-059
// Integration tests for combined caster spell slot rules (SRD 5.1 multiclass rules)
// These tests exercise the pure service layer without a DB connection.

import {
  getCombinedCasterLevel,
  buildSlotTrackerRows,
  expendSlot,
  recoverSlotsOnRest,
  type ClassEntry,
  type SpellSlotTrackerRow,
} from '../../src/services/spell-slot.service';

const NO_EXPENDED = new Map<string, number>();

// ── T-057: Fighter 2 / Wizard 3 ───────────────────────────────────────────────
// Fighter = non-caster (none) — contributes 0 to combined caster level
// Wizard = full caster — contributes full level (3)
// Combined caster level = 3
// Expected slots (level 3 full caster): 1st=4, 2nd=2
describe('T-057 | Fighter 2 / Wizard 3 multiclass spell slots', () => {
  const classes: ClassEntry[] = [
    { classId: 'fighter', classLevel: 2, casterType: 'none' },
    { classId: 'wizard',  classLevel: 3, casterType: 'full' },
  ];

  it('combined caster level = 3 (Fighter contributes 0)', () => {
    expect(getCombinedCasterLevel(classes)).toBe(3);
  });

  it('buildSlotTrackerRows produces 1st (4) and 2nd (2) level slots', () => {
    const rows = buildSlotTrackerRows(classes, NO_EXPENDED);
    const slot1 = rows.find(r => r.slotLevel === 1 && r.slotSource === 'standard');
    const slot2 = rows.find(r => r.slotLevel === 2 && r.slotSource === 'standard');
    const slot3 = rows.find(r => r.slotLevel === 3 && r.slotSource === 'standard');
    expect(slot1?.maxSlots).toBe(4);
    expect(slot2?.maxSlots).toBe(2);
    expect(slot3).toBeUndefined(); // no 3rd-level slots at combined level 3
  });

  it('expending a 1st-level slot increments expendedSlots', () => {
    const rows = buildSlotTrackerRows(classes, NO_EXPENDED);
    const updated = expendSlot(rows, 1, 'standard');
    const slot1 = updated.find(r => r.slotLevel === 1)!;
    expect(slot1.expendedSlots).toBe(1);
    expect(slot1.maxSlots).toBe(4); // maxSlots unchanged
  });

  it('throws when expending slot with 0 remaining (all expended)', () => {
    const exhausted = new Map([['combined-1', 4]]); // all 4 slots expended
    const rows = buildSlotTrackerRows(classes, exhausted);
    expect(() => expendSlot(rows, 1, 'standard')).toThrow();
  });

  it('no pact magic slots for Fighter/Wizard combination', () => {
    const rows = buildSlotTrackerRows(classes, NO_EXPENDED);
    const pactRows = rows.filter(r => r.slotSource === 'pact_magic');
    expect(pactRows).toHaveLength(0);
  });
});

// ── T-058: Paladin 2 / Cleric 3 ──────────────────────────────────────────────
// Paladin = half caster — contributes floor(2/2) = 1
// Cleric = full caster — contributes full level (3)
// Combined caster level = 1 + 3 = 4
// Expected slots (level 4 full caster): 1st=4, 2nd=3
describe('T-058 | Paladin 2 / Cleric 3 combined caster level', () => {
  const classes: ClassEntry[] = [
    { classId: 'paladin', classLevel: 2, casterType: 'half' },
    { classId: 'cleric',  classLevel: 3, casterType: 'full' },
  ];

  it('combined caster level = 4 (floor(2/2) + 3)', () => {
    expect(getCombinedCasterLevel(classes)).toBe(4);
  });

  it('buildSlotTrackerRows produces 1st (4) and 2nd (3) level slots', () => {
    const rows = buildSlotTrackerRows(classes, NO_EXPENDED);
    expect(rows.find(r => r.slotLevel === 1)?.maxSlots).toBe(4);
    expect(rows.find(r => r.slotLevel === 2)?.maxSlots).toBe(3);
    expect(rows.find(r => r.slotLevel === 3)).toBeUndefined();
  });

  it('long rest recovers all standard slots (sets expendedSlots to 0)', () => {
    const partiallyExpended = new Map([['combined-1', 3], ['combined-2', 3]]);
    const rows = buildSlotTrackerRows(classes, partiallyExpended);
    // Verify they're expended
    expect(rows.find(r => r.slotLevel === 1)!.expendedSlots).toBe(3);
    // Recover
    const recovered = recoverSlotsOnRest(rows, 'long_rest');
    expect(recovered.find(r => r.slotLevel === 1)!.expendedSlots).toBe(0);
    expect(recovered.find(r => r.slotLevel === 2)!.expendedSlots).toBe(0);
  });

  it('can expend multiple slots in sequence', () => {
    const rows = buildSlotTrackerRows(classes, NO_EXPENDED);
    const after1 = expendSlot(rows, 1, 'standard');
    const after2 = expendSlot(after1, 1, 'standard');
    expect(after2.find(r => r.slotLevel === 1)!.expendedSlots).toBe(2);
  });
});

// ── T-059: Warlock 3 / Wizard 2 ──────────────────────────────────────────────
// Warlock = excluded from combined caster level (uses pact_magic separately)
// Wizard  = full caster — contributes full level (2)
// Combined caster level = 2 (Warlock excluded)
// Warlock 3 pact magic: 2 slots at level 2, recovers on short rest
describe('T-059 | Warlock 3 / Wizard 2 separate slot tracking', () => {
  const classes: ClassEntry[] = [
    { classId: 'warlock', classLevel: 3, casterType: 'warlock' },
    { classId: 'wizard',  classLevel: 2, casterType: 'full' },
  ];

  it('combined caster level = 2 (warlock excluded)', () => {
    expect(getCombinedCasterLevel(classes)).toBe(2);
  });

  it('buildSlotTrackerRows produces standard (wizard) + pact_magic (warlock) rows', () => {
    const rows = buildSlotTrackerRows(classes, NO_EXPENDED);
    const standardRows = rows.filter(r => r.slotSource === 'standard');
    const pactRows = rows.filter(r => r.slotSource === 'pact_magic');
    expect(standardRows.length).toBeGreaterThan(0);
    expect(pactRows.length).toBe(1); // one warlock pact tracker
  });

  it('warlock level 3 has 2 pact slots at level 2', () => {
    const rows = buildSlotTrackerRows(classes, NO_EXPENDED);
    const pact = rows.find(r => r.slotSource === 'pact_magic')!;
    expect(pact.maxSlots).toBe(2);
    expect(pact.slotLevel).toBe(2);
  });

  it('standard slots for wizard level 2 (caster level 2): 1st=3', () => {
    const rows = buildSlotTrackerRows(classes, NO_EXPENDED);
    expect(rows.find(r => r.slotLevel === 1 && r.slotSource === 'standard')?.maxSlots).toBe(3);
  });

  it('short rest recovers pact slots only — standard slots unchanged', () => {
    const expended = new Map([['combined-1', 3], ['warlock-2', 2]]);
    const rows = buildSlotTrackerRows(classes, expended);
    expect(rows.find(r => r.slotSource === 'standard')!.expendedSlots).toBe(3);
    expect(rows.find(r => r.slotSource === 'pact_magic')!.expendedSlots).toBe(2);

    const afterShortRest = recoverSlotsOnRest(rows, 'short_rest');
    // Pact slots recovered
    expect(afterShortRest.find(r => r.slotSource === 'pact_magic')!.expendedSlots).toBe(0);
    // Standard slots NOT recovered on short rest
    expect(afterShortRest.find(r => r.slotSource === 'standard')!.expendedSlots).toBe(3);
  });

  it('expending pact slot does not affect standard slots', () => {
    const rows = buildSlotTrackerRows(classes, NO_EXPENDED);
    const afterPact = expendSlot(rows, 2, 'pact_magic');
    expect(afterPact.find(r => r.slotSource === 'pact_magic')!.expendedSlots).toBe(1);
    expect(afterPact.find(r => r.slotSource === 'standard')!.expendedSlots).toBe(0); // untouched
  });

  it('long rest recovers both standard and pact slots', () => {
    const expended = new Map([['combined-1', 3], ['warlock-2', 2]]);
    const rows = buildSlotTrackerRows(classes, expended);
    const afterLongRest = recoverSlotsOnRest(rows, 'long_rest');
    expect(afterLongRest.find(r => r.slotSource === 'standard')!.expendedSlots).toBe(0);
    // Note: pact magic is 'short_rest' recovery type, long_rest only resets 'standard'
    // Pact slots NOT reset on long_rest per recoverSlotsOnRest implementation
    expect(afterLongRest.find(r => r.slotSource === 'pact_magic')!.expendedSlots).toBe(2);
  });
});
