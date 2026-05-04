const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEMO_NAME = 'Demo Inventario Completo';

const skillIds = ['athletics', 'acrobatics', 'perception', 'survival', 'stealth', 'arcana'];

const itemSpecs = [
  ['Chain Mail', 1, true],
  ['Shield', 1, true],
  ['Longsword', 1, true],
  ['Longbow', 1, false],
  ['Arrows (20)', 2, false],
  ['Light Crossbow', 1, false],
  ['Crossbow Bolts (20)', 2, false],
  ["Explorer's Pack", 1, false],
  ['Backpack', 1, false],
  ['Bedroll', 1, false],
  ['Mess Kit', 1, false],
  ['Tinderbox', 1, false],
  ['Torch', 10, false],
  ['Rations (1 day)', 10, false],
  ['Waterskin', 1, false],
  ['Rope, Hempen (50ft)', 1, false],
  ['Potion of Healing', 3, false],
  ['Potion of Greater Healing', 1, false],
  ['Acid (vial)', 2, false],
  ["Alchemist's Fire", 2, false],
  ['Holy Water (flask)', 2, false],
  ['Antitoxin (vial)', 1, false],
  ['Oil (flask)', 3, false],
  ['Candle', 5, false],
  ["Healer's Kit", 1, false],
];

async function byName(model, name) {
  return prisma[model].findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
}

async function main() {
  const [race, background, cls] = await Promise.all([
    byName('race', 'Human'),
    byName('background', 'Soldier'),
    byName('class', 'Fighter'),
  ]);

  if (!race || !background || !cls) {
    throw new Error('Faltan catálogos base. Ejecuta migraciones y seed antes de crear el demo.');
  }

  const subclass = await prisma.subclass.findFirst({
    where: { class_id: cls.class_id, name: { equals: 'Champion', mode: 'insensitive' } },
  });

  const items = await prisma.item.findMany({ where: { name: { in: itemSpecs.map(([name]) => name) } } });
  const itemByName = new Map(items.map(item => [item.name, item]));
  const missing = itemSpecs.map(([name]) => name).filter(name => !itemByName.has(name));
  if (missing.length) {
    throw new Error(`Faltan objetos del catálogo: ${missing.join(', ')}`);
  }

  const spells = await prisma.spell.findMany({
    where: { name: { in: ['Shield', 'Magic Missile', 'Cure Wounds', 'Bless'] } },
  });

  const existing = await prisma.character.findFirst({ where: { name: DEMO_NAME } });
  if (existing) {
    await prisma.character.delete({ where: { id: existing.id } });
  }

  const char = await prisma.character.create({
    data: {
      name: DEMO_NAME,
      race_id: race.race_id,
      background_id: background.background_id,
      alignment: 'true_neutral',
      milestone_leveling: false,
      base_str: 15,
      base_dex: 13,
      base_con: 14,
      base_int: 10,
      base_wis: 12,
      base_cha: 8,
      current_hp: 18,
      temp_hp: 0,
      level_1_hp_roll: 8,
      xp: 900,
      gp: 42,
      personality_traits: 'Personaje demo con inventario completo para verificar cards, kits, consumibles, dados y equipamiento.',
      ideals: 'Probar que todo se pinte correctamente.',
      bonds: 'Su mochila contiene todos los casos de prueba.',
      flaws: 'Carga demasiadas cosas.',
      character_classes: {
        create: {
          class_id: cls.class_id,
          ...(subclass ? { subclass_id: subclass.subclass_id } : {}),
          class_level: 3,
          is_primary: true,
        },
      },
      active_state: { create: {} },
      character_skills: {
        create: skillIds.map(skill_id => ({
          skill_id,
          is_proficient: true,
          is_expertise: skill_id === 'perception',
        })),
      },
      inventory_items: {
        create: itemSpecs.map(([name, quantity, is_equipped]) => ({
          item_id: itemByName.get(name).item_id,
          quantity,
          is_equipped,
        })),
      },
      known_spells: spells.length
        ? { create: spells.map(spell => ({ spell_id: spell.spell_id, is_prepared: true })) }
        : undefined,
      hit_dice_trackers: {
        create: { die_type: cls.hit_die, max_dice: 3, expended_dice: 0 },
      },
      resource_pools: {
        create: [
          { pool_id: 'second_wind', current: 1, max: 1, reset_on: 'short_rest' },
          { pool_id: 'action_surge', current: 1, max: 1, reset_on: 'short_rest' },
        ],
      },
    },
    include: {
      character_classes: { include: { class: true, subclass: true } },
      inventory_items: { include: { item: true } },
    },
  });

  console.log(`Personaje demo creado: ${char.name}`);
  console.log(`ID: ${char.id}`);
  console.log(`Clase: ${char.character_classes[0].class.name} ${char.character_classes[0].class_level}`);
  console.log(`Inventario: ${char.inventory_items.length} filas`);
}

main()
  .catch(error => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
