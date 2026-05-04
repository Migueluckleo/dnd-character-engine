// prisma/seed.ts — T-017: Master seed runner
// Runs all seeders in dependency order (respecting FK constraints)
// Idempotent: safe to run multiple times (upsert logic in each seeder)

import { PrismaClient } from '@prisma/client';
import { seedLanguages }              from './seeds/language';
import { seedRaces }                  from './seeds/race';
import { seedClasses }                from './seeds/class';
import { seedBackgrounds }            from './seeds/background';
import { seedFeats }                  from './seeds/feat';
import { seedSpellSlotProgressions }  from './seeds/spell_slot_progression';
import { seedSubclasses }             from './seeds/subclass';
import { seedTraits }                 from './seeds/trait';
import { seedFeatures }               from './seeds/feature';
import { seedSpells }                 from './seeds/spell';
import { seedItems }                  from './seeds/item';
import { seedClassChoices }           from './seeds/class_choices';
import { seedBackgroundData }         from './seeds/background_data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DnD Engine seed...\n');

  // Phase 1 — No FK dependencies
  await seedLanguages(prisma);
  await seedRaces(prisma);
  await seedClasses(prisma);
  await seedBackgrounds(prisma);
  await seedFeats(prisma);
  await seedSpells(prisma);
  await seedItems(prisma);

  // Phase 2 — Depends on Classes
  await seedSpellSlotProgressions(prisma);
  await seedSubclasses(prisma);
  await seedFeatures(prisma);

  // Phase 3 — Depends on Races (junction tables)
  await seedTraits(prisma);

  // Phase 4 — Enrichment: update Classes and Backgrounds with wizard data
  await seedClassChoices(prisma);
  await seedBackgroundData(prisma);

  console.log('\n✅ Seed complete.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
