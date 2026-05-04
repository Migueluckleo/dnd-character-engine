// prisma/seeds/spell_slot_progression.ts — T-016 | Spec: US-79 (AC 79.1–79.3)
import type { PrismaClient } from '@prisma/client';

// US-79.1 — Full caster slot table
const FULL_CASTER_TABLE: Record<number, Record<number, number>> = {
  1:  { 1:2 },
  2:  { 1:3 },
  3:  { 1:4, 2:2 },
  4:  { 1:4, 2:3 },
  5:  { 1:4, 2:3, 3:2 },
  6:  { 1:4, 2:3, 3:3 },
  7:  { 1:4, 2:3, 3:3, 4:1 },
  8:  { 1:4, 2:3, 3:3, 4:2 },
  9:  { 1:4, 2:3, 3:3, 4:3, 5:1 },
  10: { 1:4, 2:3, 3:3, 4:3, 5:2 },
  11: { 1:4, 2:3, 3:3, 4:3, 5:2, 6:1 },
  12: { 1:4, 2:3, 3:3, 4:3, 5:2, 6:1 },
  13: { 1:4, 2:3, 3:3, 4:3, 5:2, 6:1, 7:1 },
  14: { 1:4, 2:3, 3:3, 4:3, 5:2, 6:1, 7:1 },
  15: { 1:4, 2:3, 3:3, 4:3, 5:2, 6:1, 7:1, 8:1 },
  16: { 1:4, 2:3, 3:3, 4:3, 5:2, 6:1, 7:1, 8:1 },
  17: { 1:4, 2:3, 3:3, 4:3, 5:2, 6:1, 7:1, 8:1, 9:1 },
  18: { 1:4, 2:3, 3:3, 4:3, 5:3, 6:1, 7:1, 8:1, 9:1 },
  19: { 1:4, 2:3, 3:3, 4:3, 5:3, 6:2, 7:1, 8:1, 9:1 },
  20: { 1:4, 2:3, 3:3, 4:3, 5:3, 6:2, 7:2, 8:1, 9:1 },
};

// US-79.3 — Warlock Pact Magic
const WARLOCK_TABLE: Record<number, { slotLevel: number; slots: number }> = {
  1:{slotLevel:1,slots:1}, 2:{slotLevel:1,slots:2},
  3:{slotLevel:2,slots:2}, 4:{slotLevel:2,slots:2},
  5:{slotLevel:3,slots:2}, 6:{slotLevel:3,slots:2},
  7:{slotLevel:4,slots:2}, 8:{slotLevel:4,slots:2},
  9:{slotLevel:5,slots:2},10:{slotLevel:5,slots:2},
  11:{slotLevel:5,slots:3},12:{slotLevel:5,slots:3},
  13:{slotLevel:5,slots:3},14:{slotLevel:5,slots:3},
  15:{slotLevel:5,slots:3},16:{slotLevel:5,slots:3},
  17:{slotLevel:5,slots:4},18:{slotLevel:5,slots:4},
  19:{slotLevel:5,slots:4},20:{slotLevel:5,slots:4},
};

export async function seedSpellSlotProgressions(prisma: PrismaClient) {
  const fullCasters   = ['bard','cleric','druid','sorcerer','wizard'];
  const halfCasters   = ['paladin','ranger'];
  let count = 0;

  // Full casters
  for (const className of fullCasters) {
    const cls = await prisma.class.findUnique({ where: { name: className } });
    if (!cls) continue;
    for (const [lvlStr, slots] of Object.entries(FULL_CASTER_TABLE)) {
      const classLevel = Number(lvlStr);
      for (const [slotLvlStr, maxSlots] of Object.entries(slots)) {
        await prisma.spellSlotProgression.upsert({
          where: { class_id_class_level_slot_level: { class_id: cls.class_id, class_level: classLevel, slot_level: Number(slotLvlStr) } },
          create: { class_id: cls.class_id, class_level: classLevel, slot_level: Number(slotLvlStr), max_slots: maxSlots, slot_source: 'standard', rest_recovery: 'long_rest' },
          update: { max_slots: maxSlots },
        });
        count++;
      }
    }
  }

  // Half casters (start at level 2, use floor(level/2) lookup)
  for (const className of halfCasters) {
    const cls = await prisma.class.findUnique({ where: { name: className } });
    if (!cls) continue;
    for (let classLevel = 2; classLevel <= 20; classLevel++) {
      const combinedLevel = Math.floor(classLevel / 2);
      const slots = FULL_CASTER_TABLE[combinedLevel];
      if (!slots) continue;
      for (const [slotLvlStr, maxSlots] of Object.entries(slots)) {
        await prisma.spellSlotProgression.upsert({
          where: { class_id_class_level_slot_level: { class_id: cls.class_id, class_level: classLevel, slot_level: Number(slotLvlStr) } },
          create: { class_id: cls.class_id, class_level: classLevel, slot_level: Number(slotLvlStr), max_slots: maxSlots, slot_source: 'standard', rest_recovery: 'long_rest' },
          update: { max_slots: maxSlots },
        });
        count++;
      }
    }
  }

  // Warlock Pact Magic (US-79.3)
  const warlock = await prisma.class.findUnique({ where: { name: 'warlock' } });
  if (warlock) {
    for (const [lvlStr, pact] of Object.entries(WARLOCK_TABLE)) {
      await prisma.spellSlotProgression.upsert({
        where: { class_id_class_level_slot_level: { class_id: warlock.class_id, class_level: Number(lvlStr), slot_level: pact.slotLevel } },
        create: { class_id: warlock.class_id, class_level: Number(lvlStr), slot_level: pact.slotLevel, max_slots: pact.slots, slot_source: 'pact_magic', rest_recovery: 'short_rest' },
        update: { max_slots: pact.slots },
      });
      count++;
    }
  }

  console.log(`  ✓ SpellSlotProgression: ${count} rows seeded`);
}
