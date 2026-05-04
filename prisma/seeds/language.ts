// prisma/seeds/language.ts — T-006 | Spec: US-84 (AC 84.1–84.2)
import type { PrismaClient } from '@prisma/client';

export async function seedLanguages(prisma: PrismaClient) {
  const languages = [
    // Standard (US-84.1)
    { name: 'common',   language_type: 'standard' as const },
    { name: 'dwarvish', language_type: 'standard' as const },
    { name: 'elvish',   language_type: 'standard' as const },
    { name: 'giant',    language_type: 'standard' as const },
    { name: 'gnomish',  language_type: 'standard' as const },
    { name: 'goblin',   language_type: 'standard' as const },
    { name: 'halfling', language_type: 'standard' as const },
    { name: 'orc',      language_type: 'standard' as const },
    // Exotic (US-84.2)
    { name: 'abyssal',     language_type: 'exotic' as const },
    { name: 'celestial',   language_type: 'exotic' as const },
    { name: 'draconic',    language_type: 'exotic' as const },
    { name: 'deep_speech', language_type: 'exotic' as const },
    { name: 'infernal',    language_type: 'exotic' as const },
    { name: 'primordial',  language_type: 'exotic' as const },
    { name: 'sylvan',      language_type: 'exotic' as const },
    { name: 'undercommon', language_type: 'exotic' as const },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where:  { name: lang.name },
      create: lang,
      update: {},
    });
  }
  console.log(`  ✓ Languages: ${languages.length} seeded`);
}
