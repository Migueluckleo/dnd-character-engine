// prisma/seeds/subclass.ts — T-009 | Spec: US-20 to US-47
// Subclasses for all 12 SRD 5.1 base classes (3 per class minimum)
import type { PrismaClient } from '@prisma/client';

export async function seedSubclasses(prisma: PrismaClient) {
  console.log('  → Seeding subclasses...');

  // Fetch all classes to get their IDs
  const classes = await prisma.class.findMany();
  const classMap = new Map(classes.map(c => [c.name, c.class_id]));

  const subclasses: Array<{ class_name: string; name: string; unlock_level: number }> = [
    // Barbarian — Primal Path (level 3)
    { class_name: 'barbarian', name: 'Path of the Berserker',    unlock_level: 3 },
    { class_name: 'barbarian', name: 'Path of the Totem Warrior', unlock_level: 3 },

    // Bard — Bard College (level 3)
    { class_name: 'bard', name: 'College of Lore',  unlock_level: 3 },
    { class_name: 'bard', name: 'College of Valor', unlock_level: 3 },

    // Cleric — Divine Domain (level 1)
    { class_name: 'cleric', name: 'Knowledge Domain', unlock_level: 1 },
    { class_name: 'cleric', name: 'Life Domain',      unlock_level: 1 },
    { class_name: 'cleric', name: 'Light Domain',     unlock_level: 1 },
    { class_name: 'cleric', name: 'Nature Domain',    unlock_level: 1 },
    { class_name: 'cleric', name: 'Tempest Domain',   unlock_level: 1 },
    { class_name: 'cleric', name: 'Trickery Domain',  unlock_level: 1 },
    { class_name: 'cleric', name: 'War Domain',       unlock_level: 1 },

    // Druid — Druid Circle (level 2)
    { class_name: 'druid', name: 'Circle of the Land', unlock_level: 2 },
    { class_name: 'druid', name: 'Circle of the Moon', unlock_level: 2 },

    // Fighter — Martial Archetype (level 3)
    { class_name: 'fighter', name: 'Champion',       unlock_level: 3 },
    { class_name: 'fighter', name: 'Battle Master',  unlock_level: 3 },
    { class_name: 'fighter', name: 'Eldritch Knight', unlock_level: 3 },

    // Monk — Monastic Tradition (level 3)
    { class_name: 'monk', name: 'Way of the Open Hand', unlock_level: 3 },
    { class_name: 'monk', name: 'Way of Shadow',        unlock_level: 3 },
    { class_name: 'monk', name: 'Way of the Four Elements', unlock_level: 3 },

    // Paladin — Sacred Oath (level 3)
    { class_name: 'paladin', name: 'Oath of Devotion', unlock_level: 3 },
    { class_name: 'paladin', name: 'Oath of the Ancients', unlock_level: 3 },
    { class_name: 'paladin', name: 'Oath of Vengeance', unlock_level: 3 },

    // Ranger — Ranger Archetype (level 3)
    { class_name: 'ranger', name: 'Hunter',        unlock_level: 3 },
    { class_name: 'ranger', name: 'Beast Master',  unlock_level: 3 },

    // Rogue — Roguish Archetype (level 3)
    { class_name: 'rogue', name: 'Thief',         unlock_level: 3 },
    { class_name: 'rogue', name: 'Assassin',      unlock_level: 3 },
    { class_name: 'rogue', name: 'Arcane Trickster', unlock_level: 3 },

    // Sorcerer — Sorcerous Origin (level 1)
    { class_name: 'sorcerer', name: 'Draconic Bloodline', unlock_level: 1 },
    { class_name: 'sorcerer', name: 'Wild Magic',         unlock_level: 1 },

    // Warlock — Otherworldly Patron (level 1)
    { class_name: 'warlock', name: 'The Archfey',    unlock_level: 1 },
    { class_name: 'warlock', name: 'The Fiend',      unlock_level: 1 },
    { class_name: 'warlock', name: 'The Great Old One', unlock_level: 1 },

    // Wizard — Arcane Tradition (level 2)
    { class_name: 'wizard', name: 'School of Abjuration',    unlock_level: 2 },
    { class_name: 'wizard', name: 'School of Conjuration',   unlock_level: 2 },
    { class_name: 'wizard', name: 'School of Divination',    unlock_level: 2 },
    { class_name: 'wizard', name: 'School of Enchantment',   unlock_level: 2 },
    { class_name: 'wizard', name: 'School of Evocation',     unlock_level: 2 },
    { class_name: 'wizard', name: 'School of Illusion',      unlock_level: 2 },
    { class_name: 'wizard', name: 'School of Necromancy',    unlock_level: 2 },
    { class_name: 'wizard', name: 'School of Transmutation', unlock_level: 2 },
  ];

  let count = 0;
  for (const sc of subclasses) {
    const class_id = classMap.get(sc.class_name);
    if (!class_id) { console.warn(`    ⚠ Class not found: ${sc.class_name}`); continue; }
    await prisma.subclass.upsert({
      where: { class_id_name: { class_id, name: sc.name } },
      update: { unlock_level: sc.unlock_level },
      create: { class_id, name: sc.name, unlock_level: sc.unlock_level },
    });
    count++;
  }
  console.log(`    ✓ ${count} subclasses seeded.`);
}
