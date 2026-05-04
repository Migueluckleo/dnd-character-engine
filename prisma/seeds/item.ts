// prisma/seeds/item.ts — Catálogo completo SRD 5.1
// Spec: US-62 to US-69 | Cubre: armas, armaduras, munición, equipo, ropa,
//       herramientas, instrumentos, packs, pociones, focos, objetos mágicos
// Todos los items referenciados en background_data.ts están incluidos con
// nombres exactos para que starting_equipment resuelva correctamente.

import type { PrismaClient } from '@prisma/client';

export async function seedItems(prisma: PrismaClient) {
  console.log('  → Seeding items (full SRD 5.1 catalog)...');

  // ─── TIPOS USADOS ──────────────────────────────────────────────────────────
  // item_type values:
  //   'weapon'     — armas (simples y marciales)
  //   'armor'      — armaduras y escudos
  //   'ammunition' — munición consumible
  //   'gear'       — equipo de aventurero y miscelánea
  //   'clothing'   — ropa y vestimentas
  //   'tool'       — herramientas artesanales, kits y juegos
  //   'instrument' — instrumentos musicales
  //   'pack'       — packs de equipo inicial
  //   'potion'     — pociones y consumibles mágicos
  //   'focus'      — focos de conjuración (arcano, sagrado, druídico)
  //   'magic_item' — objetos mágicos SRD

  const items: {
    name: string;
    item_type: string;
    weight: number;
    cost_gp: number;
    armor_category?: 'light' | 'medium' | 'heavy' | 'shield';
    ac_base?: number;
    strength_requirement?: number;
    stealth_disadvantage?: boolean;
    damage_dice?: string;
    damage_type?: string;
    properties?: Record<string, unknown>;
    pack_contents?: { item: string; qty: number }[];
    requires_attunement?: boolean;
  }[] = [

    // ═══════════════════════════════════════════════════════════════════════
    // ARMADURAS
    // ═══════════════════════════════════════════════════════════════════════

    // Ligera
    { name: 'Padded Armor',     item_type: 'armor', weight: 8,  cost_gp: 5,    armor_category: 'light',  ac_base: 11, stealth_disadvantage: true },
    { name: 'Leather Armor',    item_type: 'armor', weight: 10, cost_gp: 10,   armor_category: 'light',  ac_base: 11, stealth_disadvantage: false },
    { name: 'Studded Leather',  item_type: 'armor', weight: 13, cost_gp: 45,   armor_category: 'light',  ac_base: 12, stealth_disadvantage: false },

    // Media
    { name: 'Hide Armor',       item_type: 'armor', weight: 12, cost_gp: 10,   armor_category: 'medium', ac_base: 12, stealth_disadvantage: false },
    { name: 'Chain Shirt',      item_type: 'armor', weight: 20, cost_gp: 50,   armor_category: 'medium', ac_base: 13, stealth_disadvantage: false },
    { name: 'Scale Mail',       item_type: 'armor', weight: 45, cost_gp: 50,   armor_category: 'medium', ac_base: 14, stealth_disadvantage: true },
    { name: 'Breastplate',      item_type: 'armor', weight: 20, cost_gp: 400,  armor_category: 'medium', ac_base: 14, stealth_disadvantage: false },
    { name: 'Half Plate Armor', item_type: 'armor', weight: 40, cost_gp: 750,  armor_category: 'medium', ac_base: 15, stealth_disadvantage: true },

    // Pesada
    { name: 'Ring Mail',        item_type: 'armor', weight: 40, cost_gp: 30,   armor_category: 'heavy',  ac_base: 14, stealth_disadvantage: true },
    { name: 'Chain Mail',       item_type: 'armor', weight: 55, cost_gp: 75,   armor_category: 'heavy',  ac_base: 16, stealth_disadvantage: true, strength_requirement: 13 },
    { name: 'Splint Armor',     item_type: 'armor', weight: 60, cost_gp: 200,  armor_category: 'heavy',  ac_base: 17, stealth_disadvantage: true, strength_requirement: 15 },
    { name: 'Plate Armor',      item_type: 'armor', weight: 65, cost_gp: 1500, armor_category: 'heavy',  ac_base: 18, stealth_disadvantage: true, strength_requirement: 15 },

    // Escudo
    { name: 'Shield',           item_type: 'armor', weight: 6,  cost_gp: 10,   armor_category: 'shield', ac_base: 2,  stealth_disadvantage: false },

    // ═══════════════════════════════════════════════════════════════════════
    // ARMAS SIMPLES — CUERPO A CUERPO
    // ═══════════════════════════════════════════════════════════════════════
    { name: 'Club',          item_type: 'weapon', weight: 2,  cost_gp: 0.1,  damage_dice: '1d4',  damage_type: 'bludgeoning', properties: { light: true } },
    { name: 'Dagger',        item_type: 'weapon', weight: 1,  cost_gp: 2,    damage_dice: '1d4',  damage_type: 'piercing',    properties: { finesse: true, light: true, thrown: true, range_normal: 20, range_long: 60 } },
    { name: 'Greatclub',     item_type: 'weapon', weight: 10, cost_gp: 0.2,  damage_dice: '1d8',  damage_type: 'bludgeoning', properties: { two_handed: true } },
    { name: 'Handaxe',       item_type: 'weapon', weight: 2,  cost_gp: 5,    damage_dice: '1d6',  damage_type: 'slashing',    properties: { light: true, thrown: true, range_normal: 20, range_long: 60 } },
    { name: 'Javelin',       item_type: 'weapon', weight: 2,  cost_gp: 0.5,  damage_dice: '1d6',  damage_type: 'piercing',    properties: { thrown: true, range_normal: 30, range_long: 120 } },
    { name: 'Light Hammer',  item_type: 'weapon', weight: 2,  cost_gp: 2,    damage_dice: '1d4',  damage_type: 'bludgeoning', properties: { light: true, thrown: true, range_normal: 20, range_long: 60 } },
    { name: 'Mace',          item_type: 'weapon', weight: 4,  cost_gp: 5,    damage_dice: '1d6',  damage_type: 'bludgeoning', properties: {} },
    { name: 'Quarterstaff',  item_type: 'weapon', weight: 4,  cost_gp: 0.2,  damage_dice: '1d6',  damage_type: 'bludgeoning', properties: { versatile: true, versatile_damage: '1d8' } },
    { name: 'Sickle',        item_type: 'weapon', weight: 2,  cost_gp: 1,    damage_dice: '1d4',  damage_type: 'slashing',    properties: { light: true } },
    { name: 'Spear',         item_type: 'weapon', weight: 3,  cost_gp: 1,    damage_dice: '1d6',  damage_type: 'piercing',    properties: { thrown: true, versatile: true, versatile_damage: '1d8', range_normal: 20, range_long: 60 } },

    // ═══════════════════════════════════════════════════════════════════════
    // ARMAS SIMPLES — A DISTANCIA
    // ═══════════════════════════════════════════════════════════════════════
    { name: 'Dart',          item_type: 'weapon', weight: 0.25, cost_gp: 0.05, damage_dice: '1d4', damage_type: 'piercing',   properties: { finesse: true, thrown: true, range_normal: 20, range_long: 60 } },
    { name: 'Light Crossbow',item_type: 'weapon', weight: 5,    cost_gp: 25,   damage_dice: '1d8', damage_type: 'piercing',   properties: { ammunition: true, loading: true, two_handed: true, range_normal: 80, range_long: 320 } },
    { name: 'Shortbow',      item_type: 'weapon', weight: 2,    cost_gp: 25,   damage_dice: '1d6', damage_type: 'piercing',   properties: { ammunition: true, two_handed: true, range_normal: 80, range_long: 320 } },
    { name: 'Sling',         item_type: 'weapon', weight: 0,    cost_gp: 0.1,  damage_dice: '1d4', damage_type: 'bludgeoning',properties: { ammunition: true, range_normal: 30, range_long: 120 } },

    // ═══════════════════════════════════════════════════════════════════════
    // ARMAS MARCIALES — CUERPO A CUERPO
    // ═══════════════════════════════════════════════════════════════════════
    { name: 'Battleaxe',     item_type: 'weapon', weight: 4,  cost_gp: 10,   damage_dice: '1d8',  damage_type: 'slashing',    properties: { versatile: true, versatile_damage: '1d10' } },
    { name: 'Flail',         item_type: 'weapon', weight: 2,  cost_gp: 10,   damage_dice: '1d8',  damage_type: 'bludgeoning', properties: {} },
    { name: 'Glaive',        item_type: 'weapon', weight: 6,  cost_gp: 20,   damage_dice: '1d10', damage_type: 'slashing',    properties: { heavy: true, reach: true, two_handed: true } },
    { name: 'Greataxe',      item_type: 'weapon', weight: 7,  cost_gp: 30,   damage_dice: '1d12', damage_type: 'slashing',    properties: { heavy: true, two_handed: true } },
    { name: 'Greatsword',    item_type: 'weapon', weight: 6,  cost_gp: 50,   damage_dice: '2d6',  damage_type: 'slashing',    properties: { heavy: true, two_handed: true } },
    { name: 'Halberd',       item_type: 'weapon', weight: 6,  cost_gp: 20,   damage_dice: '1d10', damage_type: 'slashing',    properties: { heavy: true, reach: true, two_handed: true } },
    { name: 'Lance',         item_type: 'weapon', weight: 6,  cost_gp: 10,   damage_dice: '1d12', damage_type: 'piercing',    properties: { reach: true, special: true } },
    { name: 'Longsword',     item_type: 'weapon', weight: 3,  cost_gp: 15,   damage_dice: '1d8',  damage_type: 'slashing',    properties: { versatile: true, versatile_damage: '1d10' } },
    { name: 'Maul',          item_type: 'weapon', weight: 10, cost_gp: 10,   damage_dice: '2d6',  damage_type: 'bludgeoning', properties: { heavy: true, two_handed: true } },
    { name: 'Morningstar',   item_type: 'weapon', weight: 4,  cost_gp: 15,   damage_dice: '1d8',  damage_type: 'piercing',    properties: {} },
    { name: 'Pike',          item_type: 'weapon', weight: 18, cost_gp: 5,    damage_dice: '1d10', damage_type: 'piercing',    properties: { heavy: true, reach: true, two_handed: true } },
    { name: 'Rapier',        item_type: 'weapon', weight: 2,  cost_gp: 25,   damage_dice: '1d8',  damage_type: 'piercing',    properties: { finesse: true } },
    { name: 'Scimitar',      item_type: 'weapon', weight: 3,  cost_gp: 25,   damage_dice: '1d6',  damage_type: 'slashing',    properties: { finesse: true, light: true } },
    { name: 'Shortsword',    item_type: 'weapon', weight: 2,  cost_gp: 10,   damage_dice: '1d6',  damage_type: 'piercing',    properties: { finesse: true, light: true } },
    { name: 'Trident',       item_type: 'weapon', weight: 4,  cost_gp: 5,    damage_dice: '1d6',  damage_type: 'piercing',    properties: { thrown: true, versatile: true, versatile_damage: '1d8', range_normal: 20, range_long: 60 } },
    { name: 'War Pick',      item_type: 'weapon', weight: 2,  cost_gp: 5,    damage_dice: '1d8',  damage_type: 'piercing',    properties: {} },
    { name: 'Warhammer',     item_type: 'weapon', weight: 2,  cost_gp: 15,   damage_dice: '1d8',  damage_type: 'bludgeoning', properties: { versatile: true, versatile_damage: '1d10' } },
    { name: 'Whip',          item_type: 'weapon', weight: 3,  cost_gp: 2,    damage_dice: '1d4',  damage_type: 'slashing',    properties: { finesse: true, reach: true } },

    // ═══════════════════════════════════════════════════════════════════════
    // ARMAS MARCIALES — A DISTANCIA
    // ═══════════════════════════════════════════════════════════════════════
    { name: 'Blowgun',         item_type: 'weapon', weight: 1,  cost_gp: 10,  damage_dice: '1',    damage_type: 'piercing',   properties: { ammunition: true, loading: true, range_normal: 25, range_long: 100 } },
    { name: 'Hand Crossbow',   item_type: 'weapon', weight: 3,  cost_gp: 75,  damage_dice: '1d6',  damage_type: 'piercing',   properties: { ammunition: true, light: true, loading: true, range_normal: 30, range_long: 120 } },
    { name: 'Heavy Crossbow',  item_type: 'weapon', weight: 18, cost_gp: 50,  damage_dice: '1d10', damage_type: 'piercing',   properties: { ammunition: true, heavy: true, loading: true, two_handed: true, range_normal: 100, range_long: 400 } },
    { name: 'Longbow',         item_type: 'weapon', weight: 2,  cost_gp: 50,  damage_dice: '1d8',  damage_type: 'piercing',   properties: { ammunition: true, heavy: true, two_handed: true, range_normal: 150, range_long: 600 } },
    { name: 'Net',             item_type: 'weapon', weight: 3,  cost_gp: 1,   damage_dice: undefined, damage_type: undefined, properties: { thrown: true, special: true, range_normal: 5, range_long: 15 } },

    // ═══════════════════════════════════════════════════════════════════════
    // MUNICIÓN
    // ═══════════════════════════════════════════════════════════════════════
    { name: 'Arrows (20)',             item_type: 'ammunition', weight: 1,    cost_gp: 1,    properties: { weapon_type: 'bow' } },
    { name: 'Crossbow Bolts (20)',     item_type: 'ammunition', weight: 1.5,  cost_gp: 1,    properties: { weapon_type: 'crossbow' } },
    { name: 'Sling Bullets (20)',      item_type: 'ammunition', weight: 1.5,  cost_gp: 0.04, properties: { weapon_type: 'sling' } },
    { name: 'Blowgun Needles (50)',    item_type: 'ammunition', weight: 1,    cost_gp: 1,    properties: { weapon_type: 'blowgun' } },
    { name: 'Silver Arrow',            item_type: 'ammunition', weight: 0.05, cost_gp: 1,    properties: { weapon_type: 'bow', material: 'silver' } },
    { name: 'Crossbow Bolt Case',      item_type: 'ammunition', weight: 1,    cost_gp: 1,    properties: { capacity: 20 } },
    { name: 'Quiver',                  item_type: 'ammunition', weight: 1,    cost_gp: 1,    properties: { capacity: 20 } },

    // ═══════════════════════════════════════════════════════════════════════
    // EQUIPO DE AVENTURERO — GENERAL
    // ═══════════════════════════════════════════════════════════════════════
    { name: 'Backpack',              item_type: 'gear', weight: 5,    cost_gp: 2 },
    { name: 'Bedroll',               item_type: 'gear', weight: 7,    cost_gp: 1 },
    { name: 'Rope, Hempen (50ft)',   item_type: 'gear', weight: 10,   cost_gp: 1 },
    { name: 'Rope, Silk (50ft)',     item_type: 'gear', weight: 5,    cost_gp: 10 },
    { name: 'Rope (Silk)',           item_type: 'gear', weight: 5,    cost_gp: 10 },    // alias para background_data.ts
    { name: 'Torch',                 item_type: 'gear', weight: 1,    cost_gp: 0.01 },
    { name: 'Rations (1 day)',       item_type: 'gear', weight: 2,    cost_gp: 0.5 },
    { name: 'Waterskin',             item_type: 'gear', weight: 5,    cost_gp: 0.2 },
    { name: 'Tinderbox',             item_type: 'gear', weight: 1,    cost_gp: 0.5 },
    { name: 'Crowbar',               item_type: 'gear', weight: 5,    cost_gp: 2 },
    { name: 'Grappling Hook',        item_type: 'gear', weight: 4,    cost_gp: 2 },
    { name: 'Lantern, Bullseye',     item_type: 'gear', weight: 2,    cost_gp: 10 },
    { name: 'Lantern, Hooded',       item_type: 'gear', weight: 2,    cost_gp: 5 },
    { name: 'Oil (flask)',           item_type: 'gear', weight: 1,    cost_gp: 0.1 },
    { name: 'Pouch',                 item_type: 'gear', weight: 1,    cost_gp: 0.5 },
    { name: 'Sack',                  item_type: 'gear', weight: 0.5,  cost_gp: 0.01 },
    { name: 'Chest',                 item_type: 'gear', weight: 25,   cost_gp: 5 },
    { name: 'Pole (10ft)',           item_type: 'gear', weight: 7,    cost_gp: 0.05 },
    { name: 'Mirror, Steel',         item_type: 'gear', weight: 0.5,  cost_gp: 5 },
    { name: 'Spyglass',              item_type: 'gear', weight: 1,    cost_gp: 1000 },
    { name: 'Hourglass',             item_type: 'gear', weight: 1,    cost_gp: 25 },
    { name: 'Ink (1 ounce)',         item_type: 'gear', weight: 0,    cost_gp: 10 },
    { name: 'Ink',                   item_type: 'gear', weight: 0,    cost_gp: 10 },    // alias para background_data.ts
    { name: 'Paper (sheet)',         item_type: 'gear', weight: 0,    cost_gp: 0.2 },
    { name: 'Parchment (sheet)',     item_type: 'gear', weight: 0,    cost_gp: 0.1 },
    { name: 'Candle',                item_type: 'gear', weight: 0,    cost_gp: 0.01 },
    { name: 'Chalk (1 piece)',       item_type: 'gear', weight: 0,    cost_gp: 0.01 },
    { name: 'Soap',                  item_type: 'gear', weight: 0,    cost_gp: 0.02 },
    { name: 'Sealing Wax',          item_type: 'gear', weight: 0,    cost_gp: 0.5 },
    { name: 'Signal Whistle',        item_type: 'gear', weight: 0,    cost_gp: 0.05 },
    { name: 'Bell',                  item_type: 'gear', weight: 0,    cost_gp: 1 },
    { name: 'Blanket',               item_type: 'gear', weight: 3,    cost_gp: 0.5 },
    { name: 'Ball Bearings (bag)',   item_type: 'gear', weight: 2,    cost_gp: 1,    properties: { quantity: 1000 } },
    { name: 'Caltrops (bag of 20)',  item_type: 'gear', weight: 2,    cost_gp: 1 },
    { name: 'Chain (10ft)',          item_type: 'gear', weight: 10,   cost_gp: 5 },
    { name: 'Fishing Tackle',        item_type: 'gear', weight: 4,    cost_gp: 1 },
    { name: 'Hammer',                item_type: 'gear', weight: 3,    cost_gp: 1 },
    { name: 'Hammer, Sledge',        item_type: 'gear', weight: 10,   cost_gp: 2 },
    { name: 'Hunting Trap',          item_type: 'gear', weight: 25,   cost_gp: 5 },    // Outlander
    { name: 'Iron Pot',              item_type: 'gear', weight: 10,   cost_gp: 2 },    // Folk Hero
    { name: 'Mess Kit',              item_type: 'gear', weight: 1,    cost_gp: 0.2 },
    { name: 'Lamp',                  item_type: 'gear', weight: 1,    cost_gp: 0.5 },
    { name: 'Lock',                  item_type: 'gear', weight: 1,    cost_gp: 10 },
    { name: 'Magnifying Glass',      item_type: 'gear', weight: 0,    cost_gp: 100 },
    { name: 'Manacles',              item_type: 'gear', weight: 6,    cost_gp: 2 },
    { name: 'Abacus',                item_type: 'gear', weight: 2,    cost_gp: 2 },
    { name: 'Block and Tackle',      item_type: 'gear', weight: 5,    cost_gp: 1 },
    { name: 'Bottle, Glass',         item_type: 'gear', weight: 2,    cost_gp: 2 },
    { name: 'Bucket',                item_type: 'gear', weight: 2,    cost_gp: 0.05 },
    { name: 'Basket',                item_type: 'gear', weight: 2,    cost_gp: 0.04 },
    { name: 'Flask',                 item_type: 'gear', weight: 1,    cost_gp: 0.02 },
    { name: 'Jug',                   item_type: 'gear', weight: 4,    cost_gp: 0.02 },
    { name: 'Ladder (10ft)',         item_type: 'gear', weight: 25,   cost_gp: 0.1 },
    { name: 'Miner\'s Pick',         item_type: 'gear', weight: 10,   cost_gp: 2 },
    { name: 'Perfume (vial)',        item_type: 'gear', weight: 0,    cost_gp: 5 },
    { name: 'Piton',                 item_type: 'gear', weight: 0.25, cost_gp: 0.05 },
    { name: 'Portable Ram',          item_type: 'gear', weight: 35,   cost_gp: 4 },
    { name: 'Robes',                 item_type: 'gear', weight: 4,    cost_gp: 1 },
    { name: 'Scale, Merchant\'s',    item_type: 'gear', weight: 3,    cost_gp: 5 },
    { name: 'Shovel',                item_type: 'gear', weight: 5,    cost_gp: 2 },    // Folk Hero
    { name: 'Signet Ring',           item_type: 'gear', weight: 0,    cost_gp: 5 },    // Noble
    { name: 'Spellbook',             item_type: 'gear', weight: 3,    cost_gp: 50 },
    { name: 'Iron Spike',            item_type: 'gear', weight: 0.5,  cost_gp: 0.1 },
    { name: 'Staff',                 item_type: 'gear', weight: 4,    cost_gp: 0.2 },  // Outlander (no es arma)
    { name: 'Tent, Two-Person',      item_type: 'gear', weight: 20,   cost_gp: 2 },
    { name: 'Vial',                  item_type: 'gear', weight: 0,    cost_gp: 1 },
    { name: 'Whetstone',             item_type: 'gear', weight: 1,    cost_gp: 0.01 },
    { name: 'Wooden Stake',          item_type: 'gear', weight: 0,    cost_gp: 0.01 },
    { name: 'Case, Map or Scroll',   item_type: 'gear', weight: 1,    cost_gp: 1 },
    { name: 'Inkpen',                item_type: 'gear', weight: 0,    cost_gp: 0.02 }, // Sage
    { name: 'Holy Water (flask)',    item_type: 'gear', weight: 1,    cost_gp: 25,   properties: { damage_dice: '2d6', damage_type: 'radiant', vs: 'undead_or_fiend' } },
    { name: 'Acid (vial)',           item_type: 'gear', weight: 1,    cost_gp: 25,   properties: { damage_dice: '2d6', damage_type: 'acid', range_normal: 20 } },
    { name: 'Alchemist\'s Fire',     item_type: 'gear', weight: 1,    cost_gp: 50,   properties: { damage_dice: '1d4', damage_type: 'fire', on_fire: true, range_normal: 20 } },
    { name: 'Antitoxin (vial)',      item_type: 'gear', weight: 0,    cost_gp: 50,   properties: { effect: 'advantage on saving throws vs. poison for 1 hour' } },
    { name: 'Basic Poison (vial)',   item_type: 'gear', weight: 0,    cost_gp: 100,  properties: { damage_dice: '1d4', damage_type: 'poison', save: 'con_dc10' } },
    { name: 'Incense',               item_type: 'gear', weight: 0,    cost_gp: 0.1 }, // Acolyte (per stick)
    { name: 'Prayer Book',           item_type: 'gear', weight: 1,    cost_gp: 5 },   // Acolyte
    { name: 'Book of Lore',          item_type: 'gear', weight: 5,    cost_gp: 25 },  // Sage
    { name: 'Scroll of Pedigree',    item_type: 'gear', weight: 0,    cost_gp: 2 },   // Noble
    { name: 'Scroll of Lore',        item_type: 'gear', weight: 0,    cost_gp: 5 },   // Hermit
    { name: 'Insignia of Rank',      item_type: 'gear', weight: 0,    cost_gp: 1 },   // Soldier
    { name: 'Trophy',                item_type: 'gear', weight: 1,    cost_gp: 0 },   // Soldier (trofeo de un enemigo caído)
    { name: 'Component Pouch',       item_type: 'gear', weight: 2,    cost_gp: 25 },  // Bolsa de componentes de conjuro

    // ═══════════════════════════════════════════════════════════════════════
    // ROPA Y VESTIMENTAS
    // ═══════════════════════════════════════════════════════════════════════
    { name: 'Common Clothes',    item_type: 'clothing', weight: 3,  cost_gp: 0.5 },  // múltiples trasfondos
    { name: 'Fine Clothes',      item_type: 'clothing', weight: 6,  cost_gp: 15 },   // Noble, Charlatan
    { name: 'Traveler\'s Clothes', item_type: 'clothing', weight: 4,  cost_gp: 2 },
    { name: 'Costume',           item_type: 'clothing', weight: 4,  cost_gp: 5 },    // Entertainer
    { name: 'Vestments',         item_type: 'clothing', weight: 4,  cost_gp: 1 },    // Acolyte
    { name: 'Robe',              item_type: 'clothing', weight: 4,  cost_gp: 1 },

    // ═══════════════════════════════════════════════════════════════════════
    // HERRAMIENTAS ARTESANALES (Artisan's Tools)
    // ═══════════════════════════════════════════════════════════════════════
    { name: 'Alchemist\'s Supplies',   item_type: 'tool', weight: 8,  cost_gp: 50 },
    { name: 'Brewer\'s Supplies',      item_type: 'tool', weight: 9,  cost_gp: 20 },
    { name: 'Calligrapher\'s Supplies',item_type: 'tool', weight: 5,  cost_gp: 10 },
    { name: 'Carpenter\'s Tools',      item_type: 'tool', weight: 6,  cost_gp: 8 },
    { name: 'Cartographer\'s Tools',   item_type: 'tool', weight: 6,  cost_gp: 15 },
    { name: 'Cobbler\'s Tools',        item_type: 'tool', weight: 5,  cost_gp: 5 },
    { name: 'Cook\'s Utensils',        item_type: 'tool', weight: 8,  cost_gp: 1 },
    { name: 'Glassblower\'s Tools',    item_type: 'tool', weight: 5,  cost_gp: 30 },
    { name: 'Jeweler\'s Tools',        item_type: 'tool', weight: 2,  cost_gp: 25 },
    { name: 'Leatherworker\'s Tools',  item_type: 'tool', weight: 5,  cost_gp: 5 },
    { name: 'Mason\'s Tools',          item_type: 'tool', weight: 8,  cost_gp: 10 },
    { name: 'Painter\'s Supplies',     item_type: 'tool', weight: 5,  cost_gp: 10 },
    { name: 'Potter\'s Tools',         item_type: 'tool', weight: 3,  cost_gp: 10 },
    { name: 'Smith\'s Tools',          item_type: 'tool', weight: 8,  cost_gp: 20 },
    { name: 'Tinker\'s Tools',         item_type: 'tool', weight: 10, cost_gp: 50 },
    { name: 'Weaver\'s Tools',         item_type: 'tool', weight: 5,  cost_gp: 1 },
    { name: 'Woodcarver\'s Tools',     item_type: 'tool', weight: 5,  cost_gp: 1 },
    // Alias genérico referenciado por Folk Hero y Guild Artisan
    { name: 'Artisan\'s Tools',        item_type: 'tool', weight: 5,  cost_gp: 5 },

    // Kits y herramientas especiales
    { name: 'Thieves\' Tools',         item_type: 'tool', weight: 1,  cost_gp: 25 },
    { name: 'Disguise Kit',            item_type: 'tool', weight: 3,  cost_gp: 25 },  // Charlatan, Urchin
    { name: 'Forgery Kit',             item_type: 'tool', weight: 5,  cost_gp: 15 },  // Charlatan
    { name: 'Herbalism Kit',           item_type: 'tool', weight: 3,  cost_gp: 5 },   // Hermit
    { name: 'Healer\'s Kit',           item_type: 'tool', weight: 3,  cost_gp: 5,    properties: { uses: 10, effect: 'stabilize creature' } },
    { name: 'Poisoner\'s Kit',         item_type: 'tool', weight: 2,  cost_gp: 50 },
    { name: 'Navigator\'s Tools',      item_type: 'tool', weight: 2,  cost_gp: 25 },  // Sailor

    // Juegos de mesa y azar
    { name: 'Dice Set',                item_type: 'tool', weight: 0,    cost_gp: 0.1 },
    { name: 'Deck of Cards',           item_type: 'tool', weight: 0,    cost_gp: 0.5 }, // Soldier
    { name: 'Playing Card Set',        item_type: 'tool', weight: 0,    cost_gp: 0.5 },
    { name: 'Chess Set',               item_type: 'tool', weight: 0.5,  cost_gp: 1 },
    { name: 'Dragonchess Set',         item_type: 'tool', weight: 0.5,  cost_gp: 1 },
    { name: 'Three-Dragon Ante Set',   item_type: 'tool', weight: 0,    cost_gp: 1 },

    // ═══════════════════════════════════════════════════════════════════════
    // INSTRUMENTOS MUSICALES
    // ═══════════════════════════════════════════════════════════════════════
    { name: 'Bagpipes',          item_type: 'instrument', weight: 6,  cost_gp: 30 },
    { name: 'Drum',              item_type: 'instrument', weight: 3,  cost_gp: 6 },
    { name: 'Dulcimer',          item_type: 'instrument', weight: 10, cost_gp: 25 },
    { name: 'Flute',             item_type: 'instrument', weight: 1,  cost_gp: 2 },
    { name: 'Horn',              item_type: 'instrument', weight: 2,  cost_gp: 3 },
    { name: 'Lute',              item_type: 'instrument', weight: 2,  cost_gp: 35 },
    { name: 'Lyre',              item_type: 'instrument', weight: 2,  cost_gp: 30 },
    { name: 'Pan Flute',         item_type: 'instrument', weight: 2,  cost_gp: 12 },
    { name: 'Shawm',             item_type: 'instrument', weight: 1,  cost_gp: 2 },
    { name: 'Viol',              item_type: 'instrument', weight: 1,  cost_gp: 30 },
    // Alias genérico referenciado por Entertainer background
    { name: 'Musical Instrument',item_type: 'instrument', weight: 2,  cost_gp: 15 },

    // ═══════════════════════════════════════════════════════════════════════
    // PACKS DE EQUIPO INICIAL
    // ═══════════════════════════════════════════════════════════════════════
    {
      name: 'Burglar\'s Pack',
      item_type: 'pack', weight: 0, cost_gp: 16,
      pack_contents: [
        { item: 'Backpack', qty: 1 }, { item: 'Ball Bearings (bag)', qty: 1 },
        { item: 'Rope, Hempen (50ft)', qty: 1 }, { item: 'Bell', qty: 1 },
        { item: 'Candle', qty: 5 }, { item: 'Crowbar', qty: 1 },
        { item: 'Hammer', qty: 1 }, { item: 'Iron Spike', qty: 10 },
        { item: 'Lantern, Hooded', qty: 1 }, { item: 'Oil (flask)', qty: 2 },
        { item: 'Rations (1 day)', qty: 5 }, { item: 'Tinderbox', qty: 1 },
        { item: 'Waterskin', qty: 1 },
      ],
    },
    {
      name: 'Diplomat\'s Pack',
      item_type: 'pack', weight: 0, cost_gp: 39,
      pack_contents: [
        { item: 'Chest', qty: 1 }, { item: 'Fine Clothes', qty: 1 },
        { item: 'Ink', qty: 2 }, { item: 'Inkpen', qty: 1 },
        { item: 'Lamp', qty: 1 }, { item: 'Case, Map or Scroll', qty: 2 },
        { item: 'Paper (sheet)', qty: 5 }, { item: 'Perfume (vial)', qty: 1 },
        { item: 'Sealing Wax', qty: 1 }, { item: 'Soap', qty: 1 },
      ],
    },
    {
      name: 'Dungeoneer\'s Pack',
      item_type: 'pack', weight: 0, cost_gp: 12,
      pack_contents: [
        { item: 'Backpack', qty: 1 }, { item: 'Crowbar', qty: 1 },
        { item: 'Hammer', qty: 1 }, { item: 'Iron Spike', qty: 10 },
        { item: 'Torch', qty: 10 }, { item: 'Tinderbox', qty: 1 },
        { item: 'Rations (1 day)', qty: 10 }, { item: 'Waterskin', qty: 1 },
        { item: 'Rope, Hempen (50ft)', qty: 1 },
      ],
    },
    {
      name: 'Entertainer\'s Pack',
      item_type: 'pack', weight: 0, cost_gp: 40,
      pack_contents: [
        { item: 'Backpack', qty: 1 }, { item: 'Bedroll', qty: 1 },
        { item: 'Costume', qty: 2 }, { item: 'Candle', qty: 5 },
        { item: 'Rations (1 day)', qty: 5 }, { item: 'Waterskin', qty: 1 },
        { item: 'Disguise Kit', qty: 1 },
      ],
    },
    {
      name: 'Explorer\'s Pack',
      item_type: 'pack', weight: 0, cost_gp: 10,
      pack_contents: [
        { item: 'Backpack', qty: 1 }, { item: 'Bedroll', qty: 1 },
        { item: 'Mess Kit', qty: 1 }, { item: 'Tinderbox', qty: 1 },
        { item: 'Torch', qty: 10 }, { item: 'Rations (1 day)', qty: 10 },
        { item: 'Waterskin', qty: 1 }, { item: 'Rope, Hempen (50ft)', qty: 1 },
      ],
    },
    {
      name: 'Monster Hunter\'s Pack',
      item_type: 'pack', weight: 0, cost_gp: 33,
      pack_contents: [
        { item: 'Chest', qty: 1 }, { item: 'Crowbar', qty: 1 },
        { item: 'Hammer', qty: 1 }, { item: 'Wooden Stake', qty: 3 },
        { item: 'Holy Symbol (Amulet)', qty: 1 }, { item: 'Mirror, Steel', qty: 1 },
        { item: 'Holy Water (flask)', qty: 3 }, { item: 'Lantern, Hooded', qty: 1 },
        { item: 'Oil (flask)', qty: 2 }, { item: 'Tinderbox', qty: 1 },
        { item: 'Rations (1 day)', qty: 5 },
      ],
    },
    {
      name: 'Priest\'s Pack',
      item_type: 'pack', weight: 0, cost_gp: 19,
      pack_contents: [
        { item: 'Backpack', qty: 1 }, { item: 'Bedroll', qty: 1 },
        { item: 'Blanket', qty: 1 }, { item: 'Candle', qty: 10 },
        { item: 'Tinderbox', qty: 1 }, { item: 'Alchemist\'s Fire', qty: 2 },
        { item: 'Rations (1 day)', qty: 2 }, { item: 'Waterskin', qty: 1 },
      ],
    },
    {
      name: 'Scholar\'s Pack',
      item_type: 'pack', weight: 0, cost_gp: 40,
      pack_contents: [
        { item: 'Backpack', qty: 1 }, { item: 'Book of Lore', qty: 1 },
        { item: 'Ink', qty: 1 }, { item: 'Inkpen', qty: 1 },
        { item: 'Parchment (sheet)', qty: 10 }, { item: 'Rations (1 day)', qty: 1 },
        { item: 'Waterskin', qty: 1 }, { item: 'Candle', qty: 5 },
        { item: 'Tinderbox', qty: 1 },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // POCIONES Y CONSUMIBLES MÁGICOS
    // ═══════════════════════════════════════════════════════════════════════
    {
      name: 'Potion of Healing',
      item_type: 'potion', weight: 0.5, cost_gp: 50,
      properties: { heal_dice: '2d4', heal_bonus: 2, rarity: 'common', description: 'Recupera 2d4+2 PG.' },
    },
    {
      name: 'Potion of Greater Healing',
      item_type: 'potion', weight: 0.5, cost_gp: 100,
      properties: { heal_dice: '4d4', heal_bonus: 4, rarity: 'uncommon', description: 'Recupera 4d4+4 PG.' },
    },
    {
      name: 'Potion of Superior Healing',
      item_type: 'potion', weight: 0.5, cost_gp: 500,
      properties: { heal_dice: '8d4', heal_bonus: 8, rarity: 'rare', description: 'Recupera 8d4+8 PG.' },
    },
    {
      name: 'Potion of Supreme Healing',
      item_type: 'potion', weight: 0.5, cost_gp: 5000,
      properties: { heal_dice: '10d4', heal_bonus: 20, rarity: 'very_rare', description: 'Recupera 10d4+20 PG.' },
    },
    {
      name: 'Potion of Animal Friendship',
      item_type: 'potion', weight: 0.5, cost_gp: 100,
      properties: { rarity: 'uncommon', duration: '1 hour', description: 'Hechizo Animal Friendship sobre una bestia.' },
    },
    {
      name: 'Potion of Clairvoyance',
      item_type: 'potion', weight: 0.5, cost_gp: 960,
      properties: { rarity: 'rare', description: 'Hechizo Clairvoyance sin gastar espacio de conjuro.' },
    },
    {
      name: 'Potion of Climbing',
      item_type: 'potion', weight: 0.5, cost_gp: 180,
      properties: { rarity: 'common', duration: '1 hour', description: 'Velocidad de escalada igual a velocidad de movimiento. Ventaja en Atletismo (escalar).' },
    },
    {
      name: 'Potion of Diminution',
      item_type: 'potion', weight: 0.5, cost_gp: 270,
      properties: { rarity: 'rare', duration: '1d4 hours', description: 'El bebedor se encoge al tamaño Tiny.' },
    },
    {
      name: 'Potion of Flying',
      item_type: 'potion', weight: 0.5, cost_gp: 500,
      properties: { rarity: 'very_rare', duration: '1 hour', description: 'Velocidad de vuelo de 60 pies y capacidad de vuelo estacionario.' },
    },
    {
      name: 'Potion of Gaseous Form',
      item_type: 'potion', weight: 0.5, cost_gp: 300,
      properties: { rarity: 'rare', duration: '1 hour', description: 'El bebedor se convierte en gas etéreo.' },
    },
    {
      name: 'Potion of Giant Strength (Hill)',
      item_type: 'potion', weight: 0.5, cost_gp: 200,
      properties: { rarity: 'uncommon', duration: '1 hour', effect_str: 21, description: 'FUE se vuelve 21 por 1 hora (si era menor).' },
    },
    {
      name: 'Potion of Giant Strength (Stone)',
      item_type: 'potion', weight: 0.5, cost_gp: 450,
      properties: { rarity: 'rare', duration: '1 hour', effect_str: 23, description: 'FUE se vuelve 23 por 1 hora (si era menor).' },
    },
    {
      name: 'Potion of Giant Strength (Fire)',
      item_type: 'potion', weight: 0.5, cost_gp: 900,
      properties: { rarity: 'rare', duration: '1 hour', effect_str: 25, description: 'FUE se vuelve 25 por 1 hora (si era menor).' },
    },
    {
      name: 'Potion of Giant Strength (Cloud)',
      item_type: 'potion', weight: 0.5, cost_gp: 1800,
      properties: { rarity: 'very_rare', duration: '1 hour', effect_str: 27, description: 'FUE se vuelve 27 por 1 hora (si era menor).' },
    },
    {
      name: 'Potion of Giant Strength (Storm)',
      item_type: 'potion', weight: 0.5, cost_gp: 3600,
      properties: { rarity: 'legendary', duration: '1 hour', effect_str: 29, description: 'FUE se vuelve 29 por 1 hora (si era menor).' },
    },
    {
      name: 'Potion of Heroism',
      item_type: 'potion', weight: 0.5, cost_gp: 180,
      properties: { rarity: 'uncommon', duration: '1 hour', description: 'Concede 10 PG temporales e inmunidad a asustado.' },
    },
    {
      name: 'Potion of Invisibility',
      item_type: 'potion', weight: 0.5, cost_gp: 180,
      properties: { rarity: 'very_rare', duration: '1 hour', description: 'El bebedor se vuelve invisible hasta que ataca o lanza un conjuro.' },
    },
    {
      name: 'Potion of Mind Reading',
      item_type: 'potion', weight: 0.5, cost_gp: 180,
      properties: { rarity: 'rare', description: 'Hechizo Detect Thoughts sin gastar espacio de conjuro.' },
    },
    {
      name: 'Potion of Poison',
      item_type: 'potion', weight: 0.5, cost_gp: 100,
      properties: { rarity: 'uncommon', description: 'Aparenta ser una poción de curación. 3d6 veneno, posiblemente envenena.' },
    },
    {
      name: 'Potion of Resistance',
      item_type: 'potion', weight: 0.5, cost_gp: 300,
      properties: { rarity: 'uncommon', duration: '1 hour', description: 'Resistencia a un tipo de daño (ácido, frío, fuego, relámpago, trueno, etc.).' },
    },
    {
      name: 'Potion of Speed',
      item_type: 'potion', weight: 0.5, cost_gp: 400,
      properties: { rarity: 'very_rare', duration: '1 minute', description: 'Efecto hechizo Haste durante 1 minuto.' },
    },
    {
      name: 'Potion of Water Breathing',
      item_type: 'potion', weight: 0.5, cost_gp: 180,
      properties: { rarity: 'uncommon', duration: '1 hour', description: 'Permite respirar bajo el agua durante 1 hora.' },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // FOCOS DE CONJURACIÓN
    // ═══════════════════════════════════════════════════════════════════════

    // Focos arcanos (Wizard, Sorcerer, Warlock)
    { name: 'Arcane Focus (Crystal)',  item_type: 'focus', weight: 1, cost_gp: 10,  properties: { focus_type: 'arcane', classes: ['wizard', 'sorcerer', 'warlock'] } },
    { name: 'Arcane Focus (Orb)',      item_type: 'focus', weight: 3, cost_gp: 20,  properties: { focus_type: 'arcane', classes: ['wizard', 'sorcerer', 'warlock'] } },
    { name: 'Arcane Focus (Rod)',      item_type: 'focus', weight: 2, cost_gp: 10,  properties: { focus_type: 'arcane', classes: ['wizard', 'sorcerer', 'warlock'] } },
    { name: 'Arcane Focus (Staff)',    item_type: 'focus', weight: 4, cost_gp: 5,   properties: { focus_type: 'arcane', classes: ['wizard', 'sorcerer', 'warlock'] } },
    { name: 'Arcane Focus (Wand)',     item_type: 'focus', weight: 1, cost_gp: 10,  properties: { focus_type: 'arcane', classes: ['wizard', 'sorcerer', 'warlock'] } },

    // Símbolos sagrados (Cleric, Paladin)
    { name: 'Holy Symbol',            item_type: 'focus', weight: 1, cost_gp: 5,   properties: { focus_type: 'holy', classes: ['cleric', 'paladin'] } }, // alias genérico para Acolyte
    { name: 'Holy Symbol (Amulet)',   item_type: 'focus', weight: 1, cost_gp: 5,   properties: { focus_type: 'holy', classes: ['cleric', 'paladin'] } },
    { name: 'Holy Symbol (Emblem)',   item_type: 'focus', weight: 0, cost_gp: 5,   properties: { focus_type: 'holy', classes: ['cleric', 'paladin'] } },
    { name: 'Holy Symbol (Reliquary)',item_type: 'focus', weight: 2, cost_gp: 5,   properties: { focus_type: 'holy', classes: ['cleric', 'paladin'] } },

    // Focos druídicos (Druid)
    { name: 'Druidic Focus (Mistletoe)',  item_type: 'focus', weight: 0, cost_gp: 1,  properties: { focus_type: 'druidic', classes: ['druid'] } },
    { name: 'Druidic Focus (Totem)',      item_type: 'focus', weight: 0, cost_gp: 1,  properties: { focus_type: 'druidic', classes: ['druid'] } },
    { name: 'Druidic Focus (Wooden Staff)',item_type:'focus', weight: 4, cost_gp: 5,  properties: { focus_type: 'druidic', classes: ['druid'] } },
    { name: 'Druidic Focus (Yew Wand)',   item_type: 'focus', weight: 1, cost_gp: 10, properties: { focus_type: 'druidic', classes: ['druid'] } },

    // ═══════════════════════════════════════════════════════════════════════
    // OBJETOS MÁGICOS SRD — COMUNES Y NO COMUNES
    // ═══════════════════════════════════════════════════════════════════════

    // Comunes
    { name: 'Cantrip Spellwrought Tattoo',  item_type: 'magic_item', weight: 0, cost_gp: 50,   properties: { rarity: 'common', description: 'Tatuaje que otorga un truco una vez al día.' } },
    { name: 'Cloak of Billowing',           item_type: 'magic_item', weight: 1, cost_gp: 50,   properties: { rarity: 'common', description: 'Puede hacer que la capa ondee dramáticamente.' } },
    { name: 'Orb of Direction',             item_type: 'magic_item', weight: 1, cost_gp: 50,   properties: { rarity: 'common', description: 'Señala el norte magnético.' } },
    { name: 'Pot of Awakening',             item_type: 'magic_item', weight: 0, cost_gp: 50,   properties: { rarity: 'common', description: 'Planta una semilla para despertar el árbol resultante.' } },

    // No comunes (sin attunement)
    { name: 'Bag of Holding',               item_type: 'magic_item', weight: 15, cost_gp: 500,  properties: { rarity: 'uncommon', capacity_lb: 500, capacity_ft3: 64, description: 'Bolsa extradimensional que puede contener hasta 500 lb.' } },
    { name: 'Bag of Tricks (Gray)',          item_type: 'magic_item', weight: 0.5,cost_gp: 300,  properties: { rarity: 'uncommon', description: 'Saca objetos de la bolsa para invocar animales.' } },
    { name: 'Bead of Force',                item_type: 'magic_item', weight: 0,  cost_gp: 300,  properties: { rarity: 'uncommon', description: 'Lanzar para crear una esfera de fuerza de 10 pies.' } },
    { name: 'Boots of Elvenkind',           item_type: 'magic_item', weight: 1,  cost_gp: 500,  properties: { rarity: 'uncommon', description: 'Ventaja en Sigilo al moverse. No hacen ruido.' } },
    { name: 'Boots of Striding and Springing', item_type: 'magic_item', weight: 1, cost_gp: 1000, requires_attunement: true, properties: { rarity: 'uncommon', description: 'Velocidad 30 ft. Puede saltar triple distancia.' } },
    { name: 'Brooch of Shielding',          item_type: 'magic_item', weight: 0,  cost_gp: 500,  requires_attunement: true, properties: { rarity: 'uncommon', description: 'Resistencia a daño de force. Inmune a Magic Missile.' } },
    { name: 'Broom of Flying',              item_type: 'magic_item', weight: 3,  cost_gp: 500,  properties: { rarity: 'uncommon', description: 'Escoba voladora a 50 pies de velocidad, 400 lb de carga.' } },
    { name: 'Cloak of Elvenkind',           item_type: 'magic_item', weight: 1,  cost_gp: 500,  requires_attunement: true, properties: { rarity: 'uncommon', description: 'Ventaja en Sigilo. Desventaja en percepción pasiva de quienes te buscan.' } },
    { name: 'Cloak of Protection',          item_type: 'magic_item', weight: 1,  cost_gp: 3500, requires_attunement: true, properties: { rarity: 'uncommon', ac_bonus: 1, save_bonus: 1, description: '+1 CA y tiradas de salvación.' } },
    { name: 'Dust of Disappearance',        item_type: 'magic_item', weight: 0,  cost_gp: 300,  properties: { rarity: 'uncommon', description: 'Hace invisible a una criatura y todo lo que lleva durante 2d4 minutos.' } },
    { name: 'Eyes of the Eagle',            item_type: 'magic_item', weight: 0,  cost_gp: 500,  requires_attunement: true, properties: { rarity: 'uncommon', description: 'Ventaja en Percepción (vista). Con luz suficiente, ver 1 milla.' } },
    { name: 'Gloves of Missile Snaring',    item_type: 'magic_item', weight: 0,  cost_gp: 500,  requires_attunement: true, properties: { rarity: 'uncommon', description: 'Puede atrapar proyectiles con la reacción.' } },
    { name: 'Goggles of Night',             item_type: 'magic_item', weight: 0,  cost_gp: 500,  properties: { rarity: 'uncommon', darkvision_radius: 60, description: 'Visión en la oscuridad de 60 pies.' } },
    { name: 'Hat of Disguise',              item_type: 'magic_item', weight: 0,  cost_gp: 500,  requires_attunement: true, properties: { rarity: 'uncommon', description: 'Lanzar Disguise Self a voluntad.' } },
    { name: 'Headband of Intellect',        item_type: 'magic_item', weight: 0,  cost_gp: 500,  requires_attunement: true, properties: { rarity: 'uncommon', set_int: 19, description: 'INT se convierte en 19 si era menor.' } },
    { name: 'Helm of Comprehending Languages', item_type: 'magic_item', weight: 3, cost_gp: 500, properties: { rarity: 'uncommon', description: 'Comprende todos los idiomas hablados o escritos.' } },
    { name: 'Horseshoes of Speed',          item_type: 'magic_item', weight: 4,  cost_gp: 500,  properties: { rarity: 'uncommon', speed_bonus: 30, description: '+30 ft de velocidad para el caballo que las lleva.' } },
    { name: 'Immovable Rod',                item_type: 'magic_item', weight: 2,  cost_gp: 500,  properties: { rarity: 'uncommon', description: 'Se fija en el espacio como inamovible al activarse.' } },
    { name: 'Lantern of Revealing',         item_type: 'magic_item', weight: 2,  cost_gp: 500,  properties: { rarity: 'uncommon', description: 'Revela criaturas invisibles dentro de 30 pies de luz.' } },
    { name: 'Pearl of Power',               item_type: 'magic_item', weight: 0,  cost_gp: 500,  requires_attunement: true, properties: { rarity: 'uncommon', description: 'Recupera un espacio de conjuro de hasta nivel 3 una vez al día.' } },
    { name: 'Ring of Jumping',              item_type: 'magic_item', weight: 0,  cost_gp: 500,  requires_attunement: true, properties: { rarity: 'uncommon', description: 'Lanzar Jump a voluntad en ti mismo.' } },
    { name: 'Ring of Mind Shielding',       item_type: 'magic_item', weight: 0,  cost_gp: 500,  requires_attunement: true, properties: { rarity: 'uncommon', description: 'Inmune a magia que lee pensamientos o emociones.' } },
    { name: 'Ring of Protection',           item_type: 'magic_item', weight: 0,  cost_gp: 3500, requires_attunement: true, properties: { rarity: 'uncommon', ac_bonus: 1, save_bonus: 1, description: '+1 CA y tiradas de salvación.' } },
    { name: 'Ring of Swimming',             item_type: 'magic_item', weight: 0,  cost_gp: 500,  properties: { rarity: 'uncommon', swim_speed: 40, description: 'Velocidad de natación de 40 pies.' } },
    { name: 'Ring of Warmth',               item_type: 'magic_item', weight: 0,  cost_gp: 500,  requires_attunement: true, properties: { rarity: 'uncommon', description: 'Resistencia a daño por frío. Cómodo hasta -50°F.' } },
    { name: 'Rope of Climbing',             item_type: 'magic_item', weight: 3,  cost_gp: 500,  properties: { rarity: 'uncommon', description: 'Cuerda de 60 pies que puede animarse y asirse.' } },

    // Armas mágicas +1
    { name: '+1 Weapon',           item_type: 'magic_item', weight: 0, cost_gp: 500,  requires_attunement: false, properties: { rarity: 'uncommon', attack_bonus: 1, damage_bonus: 1, description: '+1 a tiradas de ataque y daño.' } },
    { name: '+2 Weapon',           item_type: 'magic_item', weight: 0, cost_gp: 2000, requires_attunement: false, properties: { rarity: 'rare',     attack_bonus: 2, damage_bonus: 2, description: '+2 a tiradas de ataque y daño.' } },
    { name: '+3 Weapon',           item_type: 'magic_item', weight: 0, cost_gp: 8000, requires_attunement: false, properties: { rarity: 'very_rare', attack_bonus: 3, damage_bonus: 3, description: '+3 a tiradas de ataque y daño.' } },

    // Armaduras mágicas +1
    { name: '+1 Armor',            item_type: 'magic_item', weight: 0, cost_gp: 1500, requires_attunement: false, properties: { rarity: 'rare',     ac_bonus: 1, description: '+1 CA sobre el valor base de la armadura.' } },
    { name: '+2 Armor',            item_type: 'magic_item', weight: 0, cost_gp: 4000, requires_attunement: false, properties: { rarity: 'very_rare', ac_bonus: 2, description: '+2 CA sobre el valor base de la armadura.' } },
    { name: '+3 Armor',            item_type: 'magic_item', weight: 0, cost_gp: 8000, requires_attunement: false, properties: { rarity: 'legendary', ac_bonus: 3, description: '+3 CA sobre el valor base de la armadura.' } },

    // Raros
    { name: 'Amulet of Health',    item_type: 'magic_item', weight: 0, cost_gp: 5000, requires_attunement: true,  properties: { rarity: 'rare', set_con: 19, description: 'CON se convierte en 19 si era menor.' } },
    { name: 'Amulet of Proof Against Detection', item_type: 'magic_item', weight: 0, cost_gp: 5000, requires_attunement: true, properties: { rarity: 'rare', description: 'Oculta del seguimiento mágico.' } },
    { name: 'Belt of Giant Strength (Hill)',  item_type: 'magic_item', weight: 1, cost_gp: 5000, requires_attunement: true, properties: { rarity: 'rare',      set_str: 21, description: 'FUE se convierte en 21.' } },
    { name: 'Belt of Giant Strength (Stone)', item_type: 'magic_item', weight: 1, cost_gp: 10000, requires_attunement: true, properties: { rarity: 'very_rare', set_str: 23, description: 'FUE se convierte en 23.' } },
    { name: 'Cloak of Displacement',         item_type: 'magic_item', weight: 1, cost_gp: 5000, requires_attunement: true, properties: { rarity: 'rare', description: 'Desventaja en ataques de primer impacto contra ti.' } },
    { name: 'Cube of Force',                 item_type: 'magic_item', weight: 0.5, cost_gp: 5000, requires_attunement: true, properties: { rarity: 'rare', description: 'Crea un cubo de fuerza de 15 pies.' } },
    { name: 'Flame Tongue',                  item_type: 'magic_item', weight: 3, cost_gp: 5000, requires_attunement: true, properties: { rarity: 'rare', damage_dice: '2d6', damage_type: 'fire', description: '2d6 de fuego adicional cuando brilla.' } },
    { name: 'Gauntlets of Ogre Power',       item_type: 'magic_item', weight: 2, cost_gp: 5000, requires_attunement: true, properties: { rarity: 'uncommon', set_str: 19, description: 'FUE se convierte en 19 si era menor.' } },
    { name: 'Gem of Seeing',                 item_type: 'magic_item', weight: 0, cost_gp: 5000, requires_attunement: true, properties: { rarity: 'rare', description: 'Truesight de 120 pies por 10 minutos (3 cargas/día).' } },
    { name: 'Ioun Stone (Awareness)',        item_type: 'magic_item', weight: 0, cost_gp: 5000, requires_attunement: true, properties: { rarity: 'uncommon', description: 'No puedes ser sorprendido.' } },
    { name: 'Necklace of Fireballs',         item_type: 'magic_item', weight: 0, cost_gp: 5000, properties: { rarity: 'rare', description: 'Collar con hasta 9 cuentas. Cada cuenta lanza Fireball (6d6).' } },
    { name: 'Portable Hole',                 item_type: 'magic_item', weight: 0, cost_gp: 5000, properties: { rarity: 'rare', description: 'Tela que crea un espacio extradimensional de 10 pies de diámetro.' } },
    { name: 'Ring of Feather Falling',       item_type: 'magic_item', weight: 0, cost_gp: 2000, requires_attunement: true, properties: { rarity: 'rare', description: 'Cae como si estuvieras bajo Feather Fall.' } },
    { name: 'Ring of Regeneration',          item_type: 'magic_item', weight: 0, cost_gp: 5000, requires_attunement: true, properties: { rarity: 'very_rare', description: 'Regenera 1d6 PG cada 10 min (max de nivel). Regenera extremidades.' } },
    { name: 'Ring of Spell Storing',         item_type: 'magic_item', weight: 0, cost_gp: 5000, requires_attunement: true, properties: { rarity: 'rare', description: 'Almacena hasta 5 niveles de conjuros para lanzar.' } },
    { name: 'Ring of X-Ray Vision',          item_type: 'magic_item', weight: 0, cost_gp: 5000, requires_attunement: true, properties: { rarity: 'rare', description: 'Ver a través de materia sólida hasta 30 pies, 1 acción.' } },
    { name: 'Robe of Useful Items',          item_type: 'magic_item', weight: 3, cost_gp: 5000, properties: { rarity: 'uncommon', description: 'Ropa con parches que se convierten en objetos útiles.' } },
    { name: 'Stone of Good Luck (Luckstone)', item_type: 'magic_item', weight: 0, cost_gp: 4200, requires_attunement: true, properties: { rarity: 'uncommon', description: '+1 a tiradas de habilidad y salvaciones.' } },
    { name: 'Wand of Magic Missiles',        item_type: 'magic_item', weight: 1, cost_gp: 5000, properties: { rarity: 'uncommon', charges: 7, description: 'Lanza Magic Missile (1–3 dardos) hasta 7 cargas, regana 1d6+1.' } },
    { name: 'Wand of Secrets',               item_type: 'magic_item', weight: 1, cost_gp: 500,  properties: { rarity: 'uncommon', charges: 3, description: 'Detecta puertas secretas y trampas a 30 pies.' } },
  ];

  // ─── UPSERT ───────────────────────────────────────────────────────────────
  let count = 0;
  for (const item of items) {
    const { pack_contents, properties, ...base } = item as any;
    await prisma.item.upsert({
      where:  { name: item.name },
      update: {
        ...base,
        properties:   properties   ?? undefined,
        pack_contents: pack_contents ?? undefined,
      },
      create: {
        ...base,
        properties:   properties   ?? undefined,
        pack_contents: pack_contents ?? undefined,
      },
    });
    count++;
  }
  console.log(`    ✓ ${count} items seeded (armas, armaduras, munición, equipo, herramientas, instrumentos, packs, pociones, focos, objetos mágicos).`);
}
