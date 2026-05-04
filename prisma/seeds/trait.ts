// prisma/seeds/trait.ts — T-011 | Spec: US-10 to US-19 (racial traits)
// Racial traits with structured effects for the hydration engine
import type { PrismaClient } from '@prisma/client';

export async function seedTraits(prisma: PrismaClient) {
  console.log('  → Seeding traits...');

  const traits: Array<{
    name: string;
    source_type: string;
    effects: object;
    races?: string[];
  }> = [
    // ── DARKVISION (shared) ──────────────────────────────────────────────────
    {
      name: 'Darkvision 60',
      source_type: 'racial',
      effects: { darkvision_ft: 60 },
      races: ['dwarf', 'elf', 'gnome', 'half-elf', 'half-orc', 'tiefling'],
    },
    {
      name: 'Superior Darkvision',
      source_type: 'racial',
      effects: { darkvision_ft: 120 },
      races: ['drow'],
    },

    // ── DWARF ────────────────────────────────────────────────────────────────
    {
      name: 'Dwarven Resilience',
      source_type: 'racial',
      effects: { advantage_saves: ['poison'], resistance: ['poison_damage'] },
      races: ['dwarf', 'hill dwarf', 'mountain dwarf'],
    },
    {
      name: 'Dwarven Combat Training',
      source_type: 'racial',
      effects: { weapon_proficiencies: ['battleaxe', 'handaxe', 'light hammer', 'warhammer'] },
      races: ['dwarf', 'hill dwarf', 'mountain dwarf'],
    },
    {
      name: 'Stonecunning',
      source_type: 'racial',
      effects: { double_proficiency: ['history_stonework'] },
      races: ['dwarf', 'hill dwarf', 'mountain dwarf'],
    },
    {
      name: 'Dwarven Toughness',
      source_type: 'racial',
      effects: { hp_bonus_per_level: 1 },
      races: ['hill dwarf'],
    },
    {
      name: 'Dwarven Armor Training',
      source_type: 'racial',
      effects: { armor_proficiencies: ['light_armor', 'medium_armor'] },
      races: ['mountain dwarf'],
    },

    // ── ELF ─────────────────────────────────────────────────────────────────
    {
      name: 'Keen Senses',
      source_type: 'racial',
      effects: { skill_proficiencies: ['perception'] },
      races: ['elf', 'high elf', 'wood elf', 'drow'],
    },
    {
      name: 'Fey Ancestry',
      source_type: 'racial',
      effects: { advantage_saves: ['charmed'], immune: ['magic_sleep'] },
      races: ['elf', 'high elf', 'wood elf', 'drow'],
    },
    {
      name: 'Trance',
      source_type: 'racial',
      effects: { long_rest_hours: 4 },
      races: ['elf', 'high elf', 'wood elf', 'drow'],
    },
    {
      name: 'Elven Weapon Training',
      source_type: 'racial',
      effects: { weapon_proficiencies: ['longsword', 'shortsword', 'shortbow', 'longbow'] },
      races: ['high elf', 'wood elf'],
    },
    {
      name: 'Cantrip (High Elf)',
      source_type: 'racial',
      effects: { free_cantrip: true, cantrip_ability: 'int' },
      races: ['high elf'],
    },
    {
      name: 'Fleet of Foot',
      source_type: 'racial',
      effects: { speed_bonus: 5 },
      races: ['wood elf'],
    },
    {
      name: 'Mask of the Wild',
      source_type: 'racial',
      effects: { hide_in_natural_terrain: true },
      races: ['wood elf'],
    },
    {
      name: 'Drow Magic',
      source_type: 'racial',
      effects: { innate_spells: ['dancing_lights', 'faerie_fire', 'darkness'], spellcasting_ability: 'cha' },
      races: ['drow'],
    },
    {
      name: 'Sunlight Sensitivity',
      source_type: 'racial',
      effects: { sunlight_disadvantage: true },
      races: ['drow'],
    },

    // ── HALFLING ─────────────────────────────────────────────────────────────
    {
      name: 'Lucky',
      source_type: 'racial',
      effects: { reroll_nat_1: true },
      races: ['halfling', 'lightfoot halfling', 'stout halfling'],
    },
    {
      name: 'Brave',
      source_type: 'racial',
      effects: { advantage_saves: ['frightened'] },
      races: ['halfling', 'lightfoot halfling', 'stout halfling'],
    },
    {
      name: 'Halfling Nimbleness',
      source_type: 'racial',
      effects: { move_through_larger_creatures: true },
      races: ['halfling', 'lightfoot halfling', 'stout halfling'],
    },
    {
      name: 'Naturally Stealthy',
      source_type: 'racial',
      effects: { hide_behind_larger_creatures: true },
      races: ['lightfoot halfling'],
    },
    {
      name: 'Stout Resilience',
      source_type: 'racial',
      effects: { advantage_saves: ['poison'], resistance: ['poison_damage'] },
      races: ['stout halfling'],
    },

    // ── HUMAN ────────────────────────────────────────────────────────────────
    {
      name: 'Extra Language',
      source_type: 'racial',
      effects: { extra_languages: 1 },
      races: ['human'],
    },

    // ── DRAGONBORN ───────────────────────────────────────────────────────────
    {
      name: 'Draconic Ancestry',
      source_type: 'racial',
      effects: { breath_weapon: true, damage_resistance: 'varies_by_ancestry' },
      races: ['dragonborn'],
    },
    {
      name: 'Breath Weapon',
      source_type: 'racial',
      effects: { uses_per_rest: 1, recovery: 'short_rest', save_type: 'varies', range: '15ft line or 30ft cone' },
      races: ['dragonborn'],
    },

    // ── GNOME ────────────────────────────────────────────────────────────────
    {
      name: 'Gnome Cunning',
      source_type: 'racial',
      effects: { advantage_saves: ['int_magic', 'wis_magic', 'cha_magic'] },
      races: ['gnome', 'forest gnome', 'rock gnome'],
    },
    {
      name: 'Natural Illusionist',
      source_type: 'racial',
      effects: { free_cantrip: true, cantrip_name: 'minor_illusion', cantrip_ability: 'int' },
      races: ['forest gnome'],
    },
    {
      name: 'Speak with Small Beasts',
      source_type: 'racial',
      effects: { speak_with_small_beasts: true },
      races: ['forest gnome'],
    },
    {
      name: 'Artificers Lore',
      source_type: 'racial',
      effects: { double_proficiency: ['history_magical_items'] },
      races: ['rock gnome'],
    },
    {
      name: 'Tinker',
      source_type: 'racial',
      effects: { construct_tiny_devices: true, tools_required: ['tinkers_tools'] },
      races: ['rock gnome'],
    },

    // ── HALF-ELF ─────────────────────────────────────────────────────────────
    {
      name: 'Half-Elf Versatility',
      source_type: 'racial',
      effects: { extra_skills: 2, extra_languages: 1 },
      races: ['half-elf'],
    },

    // ── HALF-ORC ─────────────────────────────────────────────────────────────
    {
      name: 'Menacing',
      source_type: 'racial',
      effects: { skill_proficiencies: ['intimidation'] },
      races: ['half-orc'],
    },
    {
      name: 'Relentless Endurance',
      source_type: 'racial',
      effects: { survive_at_1hp: true, uses_per_rest: 1, recovery: 'long_rest' },
      races: ['half-orc'],
    },
    {
      name: 'Savage Attacks',
      source_type: 'racial',
      effects: { crit_extra_damage_die: 1 },
      races: ['half-orc'],
    },

    // ── TIEFLING ─────────────────────────────────────────────────────────────
    {
      name: 'Hellish Resistance',
      source_type: 'racial',
      effects: { resistance: ['fire_damage'] },
      races: ['tiefling'],
    },
    {
      name: 'Infernal Legacy',
      source_type: 'racial',
      effects: {
        innate_spells: ['thaumaturgy', 'hellish_rebuke', 'darkness'],
        spellcasting_ability: 'cha',
        levels_unlocked: { thaumaturgy: 1, hellish_rebuke: 3, darkness: 5 },
      },
      races: ['tiefling'],
    },
  ];

  // Fetch all races for junction seeding
  const races = await prisma.race.findMany();
  const raceMap = new Map(races.map(r => [r.name.toLowerCase(), r.race_id]));

  let traitCount = 0;
  let junctionCount = 0;

  for (const t of traits) {
    const { races: raceNames, ...traitData } = t;
    const trait = await prisma.trait.upsert({
      where: { name: traitData.name },
      update: { effects: traitData.effects, source_type: traitData.source_type },
      create: { name: traitData.name, source_type: traitData.source_type, effects: traitData.effects },
    });
    traitCount++;

    if (raceNames) {
      for (const rn of raceNames) {
        const race_id = raceMap.get(rn.toLowerCase());
        if (!race_id) continue;
        await prisma.raceTrait.upsert({
          where: { race_id_trait_id: { race_id, trait_id: trait.trait_id } },
          update: {},
          create: { race_id, trait_id: trait.trait_id },
        });
        junctionCount++;
      }
    }
  }

  console.log(`    ✓ ${traitCount} traits, ${junctionCount} race-trait links seeded.`);
}
