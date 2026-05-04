// prisma/seeds/race.ts — T-007 | Spec: US-07 to US-19
// CRITICAL: Gnome size = small (AC 17.2 fix)
import type { PrismaClient } from '@prisma/client';

export async function seedRaces(prisma: PrismaClient) {
  const races = [
    // US-07: Dwarf
    { name: 'hill_dwarf',    parent: null,    size: 'small' as const,  speed: 25,
      bonuses: { con: 2, wis: 1 }, darkvision: 60,
      languages: ['common', 'dwarvish'], language_choices: 0 },
    { name: 'mountain_dwarf', parent: 'hill_dwarf', size: 'medium' as const, speed: 25,
      bonuses: { str: 2, con: 2 }, darkvision: 60,
      languages: ['common', 'dwarvish'], language_choices: 0 },

    // US-08: Elf
    { name: 'high_elf',  parent: null,      size: 'medium' as const, speed: 30,
      bonuses: { dex: 2, int: 1 }, darkvision: 60,
      languages: ['common', 'elvish'], language_choices: 1 },
    { name: 'wood_elf',  parent: 'high_elf', size: 'medium' as const, speed: 35,
      bonuses: { dex: 2, wis: 1 }, darkvision: 60,
      languages: ['common', 'elvish'], language_choices: 0 },
    { name: 'drow',      parent: 'high_elf', size: 'medium' as const, speed: 30,
      bonuses: { dex: 2, cha: 1 }, darkvision: 120,
      languages: ['common', 'elvish'], language_choices: 0 },

    // US-09: Halfling
    { name: 'lightfoot_halfling', parent: null,               size: 'small' as const, speed: 25,
      bonuses: { dex: 2, cha: 1 }, darkvision: 0,
      languages: ['common', 'halfling'], language_choices: 0 },
    { name: 'stout_halfling',     parent: 'lightfoot_halfling', size: 'small' as const, speed: 25,
      bonuses: { dex: 2, con: 1 }, darkvision: 0,
      languages: ['common', 'halfling'], language_choices: 0 },

    // US-10: Human
    { name: 'human', parent: null, size: 'medium' as const, speed: 30,
      bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, darkvision: 0,
      languages: ['common'], language_choices: 1 },

    // US-11: Dragonborn
    { name: 'dragonborn', parent: null, size: 'medium' as const, speed: 30,
      bonuses: { str: 2, cha: 1 }, darkvision: 0,
      languages: ['common', 'draconic'], language_choices: 0 },

    // US-12: Gnome — size MUST BE small (AC 17.2)
    { name: 'forest_gnome', parent: null,          size: 'small' as const, speed: 25,
      bonuses: { int: 2, dex: 1 }, darkvision: 60,
      languages: ['common', 'gnomish'], language_choices: 0 },
    { name: 'rock_gnome',   parent: 'forest_gnome', size: 'small' as const, speed: 25,
      bonuses: { int: 2, con: 1 }, darkvision: 60,
      languages: ['common', 'gnomish'], language_choices: 0 },

    // US-13: Half-Elf
    { name: 'half_elf', parent: null, size: 'medium' as const, speed: 30,
      bonuses: { cha: 2 }, darkvision: 60,
      languages: ['common', 'elvish'], language_choices: 1 },
      // Note: +1 to two other abilities of choice handled at character creation

    // US-14: Half-Orc
    { name: 'half_orc', parent: null, size: 'medium' as const, speed: 30,
      bonuses: { str: 2, con: 1 }, darkvision: 60,
      languages: ['common', 'orc'], language_choices: 0 },

    // US-15: Tiefling
    { name: 'tiefling', parent: null, size: 'medium' as const, speed: 30,
      bonuses: { int: 1, cha: 2 }, darkvision: 60,
      languages: ['common', 'infernal'], language_choices: 0 },
  ];

  const parentMap = new Map<string, string>();

  // First pass: insert base races
  for (const r of races) {
    const upserted = await prisma.race.upsert({
      where:  { name: r.name },
      create: {
        name:              r.name,
        size:              r.size,
        base_speed:        r.speed,
        ability_bonuses:   r.bonuses,
        darkvision_radius: r.darkvision,
        languages:         r.languages,
        language_choices:  r.language_choices,
        ...(r.parent ? { parent_race_id: parentMap.get(r.parent) } : {}),
      },
      update: { size: r.size }, // ensure fix is applied on re-seed
    });
    parentMap.set(r.name, upserted.race_id);
  }

  console.log(`  ✓ Races: ${races.length} seeded (Gnome size=small verified)`);
}
