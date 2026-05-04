// prisma/seeds/class_choices.ts — US-93/94/95/96/97
// Updates Class rows with skill choices, cantrip counts, spells known, subclass level, spellcasting ability

import type { PrismaClient } from '@prisma/client';

type ClassChoices = {
  name: string;
  starting_skill_choices: { count: number; pool: string[] | null };
  starting_cantrip_count: number;
  starting_spells_known: number;
  spellcasting_ability: string | null;
  subclass_level: number | null;
};

const ANY_SKILL = null; // null = any of the 18 skills

const CLASS_CHOICES: ClassChoices[] = [
  {
    name: 'Barbarian',
    starting_skill_choices: { count: 2, pool: ['animal_handling','athletics','intimidation','nature','perception','survival'] },
    starting_cantrip_count: 0, starting_spells_known: 0,
    spellcasting_ability: null, subclass_level: 3,
  },
  {
    name: 'Bard',
    starting_skill_choices: { count: 3, pool: ANY_SKILL },
    starting_cantrip_count: 2, starting_spells_known: 4,
    spellcasting_ability: 'cha', subclass_level: 3,
  },
  {
    name: 'Cleric',
    starting_skill_choices: { count: 2, pool: ['history','insight','medicine','persuasion','religion'] },
    starting_cantrip_count: 3, starting_spells_known: 0, // prepares spells
    spellcasting_ability: 'wis', subclass_level: 1,
  },
  {
    name: 'Druid',
    starting_skill_choices: { count: 2, pool: ['arcana','animal_handling','insight','medicine','nature','perception','religion','survival'] },
    starting_cantrip_count: 2, starting_spells_known: 0, // prepares spells
    spellcasting_ability: 'wis', subclass_level: 2,
  },
  {
    name: 'Fighter',
    starting_skill_choices: { count: 2, pool: ['acrobatics','animal_handling','athletics','history','insight','intimidation','perception','survival'] },
    starting_cantrip_count: 0, starting_spells_known: 0,
    spellcasting_ability: null, subclass_level: 3,
  },
  {
    name: 'Monk',
    starting_skill_choices: { count: 2, pool: ['acrobatics','athletics','history','insight','religion','stealth'] },
    starting_cantrip_count: 0, starting_spells_known: 0,
    spellcasting_ability: null, subclass_level: 3,
  },
  {
    name: 'Paladin',
    starting_skill_choices: { count: 2, pool: ['athletics','insight','intimidation','medicine','persuasion','religion'] },
    starting_cantrip_count: 0, starting_spells_known: 0, // prepares spells (from level 2)
    spellcasting_ability: 'cha', subclass_level: 3,
  },
  {
    name: 'Ranger',
    starting_skill_choices: { count: 3, pool: ['animal_handling','athletics','insight','investigation','nature','perception','stealth','survival'] },
    starting_cantrip_count: 0, starting_spells_known: 2, // 2 spells known at level 2; at L1 the wizard handles favored enemy/terrain
    spellcasting_ability: 'wis', subclass_level: 3,
  },
  {
    name: 'Rogue',
    starting_skill_choices: { count: 4, pool: ['acrobatics','athletics','deception','insight','intimidation','investigation','perception','performance','persuasion','sleight_of_hand','stealth'] },
    starting_cantrip_count: 0, starting_spells_known: 0,
    spellcasting_ability: null, subclass_level: 3,
  },
  {
    name: 'Sorcerer',
    starting_skill_choices: { count: 2, pool: ['arcana','deception','insight','intimidation','persuasion','religion'] },
    starting_cantrip_count: 4, starting_spells_known: 2,
    spellcasting_ability: 'cha', subclass_level: 1,
  },
  {
    name: 'Warlock',
    starting_skill_choices: { count: 2, pool: ['arcana','deception','history','intimidation','investigation','nature','religion'] },
    starting_cantrip_count: 2, starting_spells_known: 2,
    spellcasting_ability: 'cha', subclass_level: 1,
  },
  {
    name: 'Wizard',
    starting_skill_choices: { count: 2, pool: ['arcana','history','insight','investigation','medicine','religion'] },
    starting_cantrip_count: 3, starting_spells_known: 6,
    spellcasting_ability: 'int', subclass_level: 2,
  },
];

export async function seedClassChoices(prisma: PrismaClient) {
  console.log('  → Seeding class choices (skills, cantrips, spells, subclass level)...');
  let count = 0;
  for (const c of CLASS_CHOICES) {
    await prisma.class.updateMany({
      where: { name: { equals: c.name, mode: 'insensitive' } },
      data: {
        starting_skill_choices: c.starting_skill_choices as any,
        starting_cantrip_count: c.starting_cantrip_count,
        starting_spells_known: c.starting_spells_known,
        spellcasting_ability: c.spellcasting_ability ?? undefined,
        subclass_level: c.subclass_level ?? undefined,
      },
    });
    count++;
  }
  console.log(`    ✓ ${count} classes updated with starting choices.`);
}
