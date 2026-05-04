// prisma/seeds/background.ts — T-010 | Spec: US-48 to US-61
import type { PrismaClient } from '@prisma/client';

export async function seedBackgrounds(prisma: PrismaClient) {
  const backgrounds = [
    { name: 'acolyte',       gold: 15, skills: ['insight','religion'],         tools: [],                          language_grants: [], language_choices: 2 },
    { name: 'charlatan',     gold: 15, skills: ['deception','sleight_of_hand'], tools: ['disguise_kit','forgery_kit'], language_grants: [], language_choices: 0 },
    { name: 'criminal',      gold: 15, skills: ['deception','stealth'],         tools: ['gaming_set','thieves_tools'], language_grants: [], language_choices: 0 },
    { name: 'entertainer',   gold: 15, skills: ['acrobatics','performance'],    tools: ['disguise_kit','musical_instrument'], language_grants: [], language_choices: 0 },
    { name: 'folk_hero',     gold: 10, skills: ['animal_handling','survival'],  tools: ['artisan_tools','vehicles_land'], language_grants: [], language_choices: 0 },
    { name: 'guild_artisan', gold: 15, skills: ['insight','persuasion'],        tools: ['artisan_tools'],            language_grants: [], language_choices: 1 },
    { name: 'hermit',        gold: 5,  skills: ['medicine','religion'],         tools: ['herbalism_kit'],            language_grants: [], language_choices: 1 },
    { name: 'noble',         gold: 25, skills: ['history','persuasion'],        tools: ['gaming_set'],               language_grants: [], language_choices: 1 },
    { name: 'outlander',     gold: 10, skills: ['athletics','survival'],        tools: ['musical_instrument'],       language_grants: [], language_choices: 1 },
    { name: 'sage',          gold: 10, skills: ['arcana','history'],            tools: [],                           language_grants: [], language_choices: 2 },
    { name: 'sailor',        gold: 10, skills: ['athletics','perception'],      tools: ['navigators_tools','vehicles_water'], language_grants: [], language_choices: 0 },
    { name: 'soldier',       gold: 10, skills: ['athletics','intimidation'],    tools: ['gaming_set','vehicles_land'], language_grants: [], language_choices: 0 },
    { name: 'urchin',        gold: 10, skills: ['sleight_of_hand','stealth'],   tools: ['disguise_kit','thieves_tools'], language_grants: [], language_choices: 0 },
  ];

  for (const bg of backgrounds) {
    await prisma.background.upsert({
      where:  { name: bg.name },
      create: {
        name:               bg.name,
        starting_gold:      bg.gold,
        skill_proficiencies:bg.skills,
        tool_proficiencies: bg.tools,
        language_grants:    bg.language_grants,
        language_choices:   bg.language_choices,
      },
      update: {},
    });
  }
  console.log(`  ✓ Backgrounds: ${backgrounds.length} seeded`);
}
