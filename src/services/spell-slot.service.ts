// src/services/spell-slot.service.ts
// T-028 | Spec: US-79 (AC 79.1–79.6), US-82.4

export type CasterType = 'full' | 'half' | 'warlock' | 'none';

export interface ClassEntry {
  classId: string;
  casterType: CasterType;
  classLevel: number;
}

export interface SpellSlotTrackerRow {
  classId: string;
  slotLevel: number;
  maxSlots: number;
  expendedSlots: number;
  slotSource: 'standard' | 'pact_magic';
}

/** US-79.1 — Full caster slot table (levels 1–5, slots for levels 1–3) */
const FULL_CASTER_SLOTS: Record<number, Record<number, number>> = {
  1: { 1: 2 },
  2: { 1: 3 },
  3: { 1: 4, 2: 2 },
  4: { 1: 4, 2: 3 },
  5: { 1: 4, 2: 3, 3: 2 },
  6: { 1: 4, 2: 3, 3: 3 },
  7: { 1: 4, 2: 3, 3: 3, 4: 1 },
  8: { 1: 4, 2: 3, 3: 3, 4: 2 },
  9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
};

/** US-79.3 — Warlock Pact Magic slot table */
const WARLOCK_PACT_SLOTS: Record<number, { slotLevel: number; slots: number }> = {
  1:  { slotLevel: 1, slots: 1 },
  2:  { slotLevel: 1, slots: 2 },
  3:  { slotLevel: 2, slots: 2 },
  4:  { slotLevel: 2, slots: 2 },
  5:  { slotLevel: 3, slots: 2 },
  6:  { slotLevel: 3, slots: 2 },
  7:  { slotLevel: 4, slots: 2 },
  8:  { slotLevel: 4, slots: 2 },
  9:  { slotLevel: 5, slots: 2 },
  10: { slotLevel: 5, slots: 2 },
  11: { slotLevel: 5, slots: 3 },
  12: { slotLevel: 5, slots: 3 },
  13: { slotLevel: 5, slots: 3 },
  14: { slotLevel: 5, slots: 3 },
  15: { slotLevel: 5, slots: 3 },
  16: { slotLevel: 5, slots: 3 },
  17: { slotLevel: 5, slots: 4 },
  18: { slotLevel: 5, slots: 4 },
  19: { slotLevel: 5, slots: 4 },
  20: { slotLevel: 5, slots: 4 },
};

/**
 * US-82.4: Calculate combined caster level for multiclassed characters.
 * - full casters: contribute full class level
 * - half casters: contribute floor(classLevel / 2)
 * - warlocks: tracked separately (pact magic)
 * - none: contribute 0
 */
export function getCombinedCasterLevel(classes: ClassEntry[]): number {
  return classes.reduce((total, cls) => {
    if (cls.casterType === 'full') return total + cls.classLevel;
    if (cls.casterType === 'half') return total + Math.floor(cls.classLevel / 2);
    return total;
  }, 0);
}

/**
 * US-79.1–79.4: Build the expected SpellSlotTracker rows for a character.
 * Returns new rows — caller is responsible for syncing with DB.
 */
export function buildSlotTrackerRows(
  classes: ClassEntry[],
  existingExpended: Map<string, number>, // key: `${classId}-${slotLevel}`
): SpellSlotTrackerRow[] {
  const rows: SpellSlotTrackerRow[] = [];

  const warlockEntry = classes.find(c => c.casterType === 'warlock');
  const nonWarlockClasses = classes.filter(c => c.casterType !== 'warlock');
  const combinedLevel = getCombinedCasterLevel(nonWarlockClasses);

  // Standard slots (non-warlock)
  if (combinedLevel > 0) {
    const slotTable = FULL_CASTER_SLOTS[combinedLevel] ?? {};
    for (const [slotLevelStr, maxSlots] of Object.entries(slotTable)) {
      const slotLevel = Number(slotLevelStr);
      const key = `combined-${slotLevel}`;
      rows.push({
        classId: 'combined',
        slotLevel,
        maxSlots,
        expendedSlots: existingExpended.get(key) ?? 0,
        slotSource: 'standard',
      });
    }
  }

  // Warlock Pact Magic (separate tracker)
  if (warlockEntry) {
    const pact = WARLOCK_PACT_SLOTS[warlockEntry.classLevel];
    if (pact) {
      const key = `${warlockEntry.classId}-${pact.slotLevel}`;
      rows.push({
        classId: warlockEntry.classId,
        slotLevel: pact.slotLevel,
        maxSlots: pact.slots,
        expendedSlots: existingExpended.get(key) ?? 0,
        slotSource: 'pact_magic',
      });
    }
  }

  return rows;
}

/**
 * US-79.5: Expend one slot. Throws if no slots available.
 */
export function expendSlot(
  trackers: SpellSlotTrackerRow[],
  slotLevel: number,
  source: 'standard' | 'pact_magic',
): SpellSlotTrackerRow[] {
  const target = trackers.find(t => t.slotLevel === slotLevel && t.slotSource === source);
  if (!target) {
    throw new Error(`No spell slot tracker found for level ${slotLevel} (${source}).`);
  }
  if (target.expendedSlots >= target.maxSlots) {
    throw new Error(`No available spell slots at level ${slotLevel} (${source}).`);
  }
  return trackers.map(t =>
    t === target ? { ...t, expendedSlots: t.expendedSlots + 1 } : t,
  );
}

/**
 * US-79.6: Reset expended slots on rest.
 * Long rest resets 'standard'; short rest resets 'pact_magic'.
 */
export function recoverSlotsOnRest(
  trackers: SpellSlotTrackerRow[],
  restType: 'short_rest' | 'long_rest',
): SpellSlotTrackerRow[] {
  return trackers.map(t => {
    const shouldReset =
      restType === 'long_rest' ? t.slotSource === 'standard' :
      restType === 'short_rest' ? t.slotSource === 'pact_magic' : false;
    return shouldReset ? { ...t, expendedSlots: 0 } : t;
  });
}
