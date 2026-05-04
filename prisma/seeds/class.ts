// prisma/seeds/class.ts — T-008 | Spec: US-20 to US-47
import type { PrismaClient } from '@prisma/client';

export async function seedClasses(prisma: PrismaClient) {
  const classes = [
    { name: 'barbarian', hit_die: 12, caster_type: 'none' as const,
      saving_throws: ['str', 'con'],
      multiclass_prerequisites: { str: 13 },
      multiclass_proficiencies: { light_armor: true, medium_armor: true, shields: true, simple_weapons: true, martial_weapons: true } },

    { name: 'bard', hit_die: 8, caster_type: 'full' as const,
      saving_throws: ['dex', 'cha'],
      multiclass_prerequisites: { cha: 13 },
      multiclass_proficiencies: { light_armor: true, one_skill: true, one_instrument: true } },

    { name: 'cleric', hit_die: 8, caster_type: 'full' as const,
      saving_throws: ['wis', 'cha'],
      multiclass_prerequisites: { wis: 13 },
      multiclass_proficiencies: { light_armor: true, medium_armor: true, shields: true } },

    { name: 'druid', hit_die: 8, caster_type: 'full' as const,
      saving_throws: ['int', 'wis'],
      multiclass_prerequisites: { wis: 13 },
      multiclass_proficiencies: { light_armor: true, medium_armor: true, shields: true } },

    { name: 'fighter', hit_die: 10, caster_type: 'none' as const,
      saving_throws: ['str', 'con'],
      multiclass_prerequisites: { str_or_dex: 13 },
      multiclass_proficiencies: { light_armor: true, medium_armor: true, shields: true, simple_weapons: true, martial_weapons: true } },

    { name: 'monk', hit_die: 8, caster_type: 'none' as const,
      saving_throws: ['str', 'dex'],
      multiclass_prerequisites: { dex: 13, wis: 13 },
      multiclass_proficiencies: { simple_weapons: true, shortswords: true } },

    { name: 'paladin', hit_die: 10, caster_type: 'half' as const,
      saving_throws: ['wis', 'cha'],
      multiclass_prerequisites: { str: 13, cha: 13 },
      multiclass_proficiencies: { light_armor: true, medium_armor: true, shields: true, simple_weapons: true, martial_weapons: true } },

    { name: 'ranger', hit_die: 10, caster_type: 'half' as const,
      saving_throws: ['str', 'dex'],
      multiclass_prerequisites: { dex: 13, wis: 13 },
      multiclass_proficiencies: { light_armor: true, medium_armor: true, shields: true, simple_weapons: true, martial_weapons: true, one_skill: true } },

    { name: 'rogue', hit_die: 8, caster_type: 'none' as const,
      saving_throws: ['dex', 'int'],
      multiclass_prerequisites: { dex: 13 },
      multiclass_proficiencies: { light_armor: true, one_skill: true, thieves_tools: true } },

    { name: 'sorcerer', hit_die: 6, caster_type: 'full' as const,
      saving_throws: ['con', 'cha'],
      multiclass_prerequisites: { cha: 13 },
      multiclass_proficiencies: {} },

    { name: 'warlock', hit_die: 8, caster_type: 'warlock' as const,
      saving_throws: ['wis', 'cha'],
      multiclass_prerequisites: { cha: 13 },
      multiclass_proficiencies: { light_armor: true, simple_weapons: true } },

    { name: 'wizard', hit_die: 6, caster_type: 'full' as const,
      saving_throws: ['int', 'wis'],
      multiclass_prerequisites: { int: 13 },
      multiclass_proficiencies: {} },
  ];

  for (const cls of classes) {
    await prisma.class.upsert({
      where:  { name: cls.name },
      create: {
        name:                     cls.name,
        hit_die:                  cls.hit_die,
        caster_type:              cls.caster_type,
        saving_throws:            cls.saving_throws,
        starting_proficiencies:   {},
        multiclass_proficiencies: cls.multiclass_proficiencies,
        multiclass_prerequisites: cls.multiclass_prerequisites,
      },
      update: { caster_type: cls.caster_type },
    });
  }
  console.log(`  ✓ Classes: ${classes.length} seeded`);
}
