/**
 * src/client/inventoryHelpers.ts
 * Phase 4 — Pure inventory / item-display helpers extracted from ui.html.
 *
 * Rules (CLAUDE.md §2):
 *  - No DOM manipulation, no API calls, no global mutable state.
 *  - All identifiers follow camelCase (English); user-facing strings are Spanish.
 *  - Exported on `window.DND_ITEM_HELPERS` so ui.html can delegate without
 *    duplicating logic.
 */

import { escapeText } from './legacy-utils';

// ─── Lightweight item-data interfaces ────────────────────────────────────────
// These mirror the shapes returned by the REST API / preview fixtures.

export interface ItemProperties {
  ammunition?: boolean;
  finesse?: boolean;
  heavy?: boolean;
  light?: boolean;
  loading?: boolean;
  reach?: boolean;
  special?: boolean;
  thrown?: boolean;
  two_handed?: boolean;
  versatile?: boolean;
  versatile_damage?: string;
  range_normal?: number;
  range_long?: number;
  heal_dice?: string;
  heal_bonus?: number;
  damage_dice?: string;
  damage_type?: string;
  duration?: string;
  weapon_type?: string;
  rarity?: string;
  effect?: string;
  description?: string;
  advantage?: string;
  ventaja?: string;
  immunity?: string;
  immune?: string;
  inmune?: string;
  consumable?: boolean;
  [key: string]: unknown;
}

export interface CatalogItem {
  item_id?: string;
  name?: string;
  item_type?: string;
  armor_category?: string;
  ac_base?: number;
  damage_dice?: string;
  damage_type?: string;
  weight?: number;
  cost_gp?: number;
  strength_requirement?: number;
  stealth_disadvantage?: boolean;
  requires_attunement?: boolean;
  rarity?: string;
  description?: string;
  properties?: ItemProperties;
  pack_contents?: Array<{ item?: string; item_id?: string; qty?: number; quantity?: number }>;
}

export interface InventoryEntry {
  item_id?: string;
  quantity?: number;
  is_equipped?: boolean;
  is_attuned?: boolean;
  item?: CatalogItem;
}

export interface RarityTheme {
  color: string;
  bg: string;
  label: string;
}

export interface DrawerRule {
  label: string;
  value: string;
}

// ─── Spanish item-name lookup ─────────────────────────────────────────────────
export const ITEM_NAME_ES: Record<string, string> = {
  // ── Armaduras ──────────────────────────────────────────────────────────────
  'Padded Armor':'Armadura Acolchada','Leather Armor':'Armadura de Cuero','Studded Leather':'Cuero Tachonado',
  'Hide Armor':'Armadura de Pieles','Chain Shirt':'Camisote de Mallas','Scale Mail':'Cota de Escamas',
  'Breastplate':'Peto','Half Plate Armor':'Media Armadura de Placas','Ring Mail':'Cota de Anillas',
  'Chain Mail':'Cota de Mallas','Splint Armor':'Armadura de Tablillas','Plate Armor':'Armadura de Placas',
  'Shield':'Escudo',
  // ── Armas simples ──────────────────────────────────────────────────────────
  'Club':'Porra','Dagger':'Daga','Greatclub':'Gran Porra','Handaxe':'Hacha de Mano','Javelin':'Jabalina',
  'Light Hammer':'Martillo Ligero','Mace':'Maza','Quarterstaff':'Bastón','Sickle':'Hoz','Spear':'Lanza',
  'Light Crossbow':'Ballesta Ligera','Dart':'Dardo','Shortbow':'Arco Corto','Sling':'Honda',
  // ── Armas marciales ────────────────────────────────────────────────────────
  'Battleaxe':'Hacha de Batalla','Flail':'Mayal','Glaive':'Guja','Greataxe':'Gran Hacha',
  'Greatsword':'Gran Espada','Halberd':'Alabarda','Lance':'Lanza de Caballería','Longsword':'Espada Larga',
  'Maul':'Maza Grande','Morningstar':'Estrella de la Mañana','Pike':'Pica','Rapier':'Estoque',
  'Scimitar':'Cimitarra','Shortsword':'Espada Corta','Trident':'Tridente','War Pick':'Pico de Guerra',
  'Warhammer':'Martillo de Guerra','Whip':'Látigo','Blowgun':'Cerbatana','Hand Crossbow':'Ballesta de Mano',
  'Heavy Crossbow':'Ballesta Pesada','Longbow':'Arco Largo','Net':'Red',
  // ── Munición ───────────────────────────────────────────────────────────────
  'Arrows (20)':'Flechas (20)','Crossbow Bolts (20)':'Virotes (20)','Sling Bullets (20)':'Balas de Honda (20)',
  'Blowgun Needles (50)':'Agujas de Cerbatana (50)','Silver Arrow':'Flecha de Plata',
  // ── Equipo de aventurero ───────────────────────────────────────────────────
  'Abacus':'Ábaco','Acid (vial)':'Ácido (vial)',"Alchemist's Fire":'Fuego de Alquimista',
  'Antitoxin (vial)':'Antitoxina (vial)','Backpack':'Mochila','Ball Bearings (bag)':'Cojinetes de Acero (bolsa)',
  'Basic Poison (vial)':'Veneno Básico (vial)','Basket':'Cesta','Bedroll':'Saco de Dormir','Bell':'Campana',
  'Blanket':'Manta','Block and Tackle':'Polipasto','Bottle, Glass':'Botella de Vidrio','Bucket':'Cubo',
  'Caltrops (bag of 20)':'Abrojos (bolsa de 20)','Candle':'Vela','Case, Map or Scroll':'Tubo para Mapas',
  'Chain (10ft)':'Cadena (3m)','Chalk (1 piece)':'Tiza','Chest':'Cofre','Crossbow Bolt Case':'Carcaj de Virotes',
  'Crowbar':'Palanca','Disguise Kit':'Kit de Disfraz','Fishing Tackle':'Equipo de Pesca','Flask':'Frasco',
  'Forgery Kit':'Kit de Falsificación','Grappling Hook':'Garfio','Hammer':'Martillo','Hammer, Sledge':'Mazo',
  "Healer's Kit":'Kit de Curación','Holy Symbol':'Símbolo Sagrado',
  'Holy Symbol (Amulet)':'Símbolo Sagrado (Amuleto)','Holy Symbol (Emblem)':'Símbolo Sagrado (Emblema)',
  'Holy Symbol (Reliquary)':'Símbolo Sagrado (Relicario)','Holy Water (flask)':'Agua Bendita (frasco)',
  'Hourglass':'Reloj de Arena','Hunting Trap':'Trampa de Caza','Incense':'Incienso','Ink':'Tinta',
  'Ink (1 ounce)':'Tinta (1 onza)','Inkpen':'Pluma de Escribir','Insignia of Rank':'Insignia de Rango',
  'Iron Pot':'Olla de Hierro','Iron Spike':'Clavo de Hierro','Jug':'Jarra','Ladder (10ft)':'Escalera (3m)',
  'Lamp':'Lámpara','Lantern, Bullseye':'Linterna de Ojo de Buey','Lantern, Hooded':'Linterna con Capucha',
  'Lock':'Candado','Magnifying Glass':'Lupa','Manacles':'Grilletes','Mess Kit':'Kit de Campaña',
  "Miner's Pick":'Pico de Minero','Mirror, Steel':'Espejo de Acero','Oil (flask)':'Aceite (frasco)',
  'Paper (sheet)':'Papel (hoja)','Parchment (sheet)':'Pergamino (hoja)','Perfume (vial)':'Perfume (vial)',
  'Piton':'Pitón','Pole (10ft)':'Palo (3m)','Portable Ram':'Ariete Portátil','Pouch':'Bolsa',
  'Prayer Book':'Libro de Oraciones','Quiver':'Carcaj','Rations (1 day)':'Raciones (1 día)',
  'Rope, Hempen (50ft)':'Cuerda de Cáñamo (15m)','Rope (Silk)':'Cuerda de Seda',
  'Rope, Silk (50ft)':'Cuerda de Seda (15m)','Sack':'Saco',"Scale, Merchant's":'Balanza de Mercader',
  'Scroll of Lore':'Pergamino de Conocimiento','Scroll of Pedigree':'Pergamino de Pedigree',
  'Sealing Wax':'Lacre','Signal Whistle':'Silbato de Señales','Signet Ring':'Anillo de Sello',
  'Soap':'Jabón','Spellbook':'Libro de Conjuros','Spyglass':'Catalejo',
  'Tent, Two-Person':'Tienda de Campaña (2 personas)','Tinderbox':'Yesca','Torch':'Antorcha',
  'Trophy':'Trofeo','Vial':'Vial','Vestments':'Vestiduras','Waterskin':'Odre',
  'Whetstone':'Piedra de Afilar','Wooden Stake':'Estaca de Madera','Shovel':'Pala',
  // ── Ropa ───────────────────────────────────────────────────────────────────
  'Common Clothes':'Ropa Común','Costume':'Disfraz','Fine Clothes':'Ropa Elegante',
  'Robe':'Túnica','Robes':'Túnicas',"Traveler's Clothes":'Ropa de Viajero',
  // ── Herramientas e instrumentos ────────────────────────────────────────────
  "Alchemist's Supplies":'Suministros de Alquimista',"Artisan's Tools":'Herramientas de Artesano',
  'Bagpipes':'Gaita',"Brewer's Supplies":'Suministros de Cervecero',
  "Calligrapher's Supplies":'Suministros de Calígrafo',"Carpenter's Tools":'Herramientas de Carpintero',
  "Cartographer's Tools":'Herramientas de Cartógrafo','Chess Set':'Juego de Ajedrez',
  "Cobbler's Tools":'Herramientas de Zapatero','Component Pouch':'Bolsa de Componentes',
  "Cook's Utensils":'Utensilios de Cocina','Deck of Cards':'Mazo de Cartas','Dice Set':'Juego de Dados',
  'Drum':'Tambor','Dulcimer':'Dulcémele','Flute':'Flauta',"Glassblower's Tools":'Herramientas de Vidriero',
  'Herbalism Kit':'Kit de Herbolario','Horn':'Cuerno',"Jeweler's Tools":'Herramientas de Joyero',
  "Leatherworker's Tools":'Herramientas de Talabartero','Lute':'Laúd','Lyre':'Lira',
  "Mason's Tools":'Herramientas de Albañil','Musical Instrument':'Instrumento Musical',
  "Navigator's Tools":'Herramientas de Navegante',"Painter's Supplies":'Suministros de Pintor',
  'Pan Flute':'Flauta de Pan','Playing Card Set':'Juego de Cartas',"Poisoner's Kit":'Kit de Venenos',
  "Potter's Tools":'Herramientas de Alfarero','Shawm':'Chirimía',"Smith's Tools":'Herramientas de Herrero',
  'Three-Dragon Ante Set':'Juego Tres Dragones',"Thieves' Tools":'Herramientas de Ladrón',
  "Tinker's Tools":'Herramientas de Chapucero','Viol':'Viola',"Weaver's Tools":'Herramientas de Tejedor',
  "Woodcarver's Tools":'Herramientas de Tallador','Dragonchess Set':'Ajedrez Dragón',
  // ── Packs ──────────────────────────────────────────────────────────────────
  "Burglar's Pack":'Paquete de Ladrón',"Diplomat's Pack":'Paquete de Diplomático',
  "Dungeoneer's Pack":'Paquete de Explorador de Mazmorras',"Entertainer's Pack":'Paquete de Artista',
  "Explorer's Pack":'Paquete de Explorador',"Monster Hunter's Pack":'Paquete de Cazamonstruos',
  "Priest's Pack":'Paquete de Sacerdote',"Scholar's Pack":'Paquete de Erudito',
  // ── Pociones ───────────────────────────────────────────────────────────────
  'Potion of Healing':'Poción de Curación','Potion of Greater Healing':'Poción de Curación Mayor',
  'Potion of Superior Healing':'Poción de Curación Superior','Potion of Supreme Healing':'Poción de Curación Suprema',
  'Potion of Poison':'Poción de Veneno','Antitoxin':'Antitoxina',
  // ── Focos ──────────────────────────────────────────────────────────────────
  'Arcane Focus (Crystal)':'Foco Arcano (Cristal)','Arcane Focus (Orb)':'Foco Arcano (Orbe)',
  'Arcane Focus (Rod)':'Foco Arcano (Vara)','Arcane Focus (Staff)':'Foco Arcano (Bastón)',
  'Arcane Focus (Wand)':'Foco Arcano (Varita)','Druidic Focus (Mistletoe)':'Foco Druídico (Muérdago)',
  'Druidic Focus (Totem)':'Foco Druídico (Tótem)','Druidic Focus (Wooden Staff)':'Foco Druídico (Bastón de Madera)',
  'Druidic Focus (Yew Wand)':'Foco Druídico (Varita de Tejo)','Staff':'Bastón',
  // ── Objetos mágicos ────────────────────────────────────────────────────────
  '+1 Armor':'Armadura +1','+2 Armor':'Armadura +2','+3 Armor':'Armadura +3',
  '+1 Weapon':'Arma +1','+2 Weapon':'Arma +2','+3 Weapon':'Arma +3',
  'Amulet of Health':'Amuleto de Salud',
  'Amulet of Proof Against Detection':'Amuleto contra Detección',
  'Bag of Holding':'Bolsa de Contención','Bag of Tricks (Gray)':'Bolsa de Trucos (Gris)',
  'Bead of Force':'Cuenta de Fuerza','Belt of Giant Strength (Hill)':'Cinturón de Fuerza de Gigante (Colina)',
  'Belt of Giant Strength (Stone)':'Cinturón de Fuerza de Gigante (Piedra)',
  'Book of Lore':'Libro de Conocimiento','Boots of Elvenkind':'Botas Élvicas',
  'Boots of Striding and Springing':'Botas de Zancada y Salto','Brooch of Shielding':'Broche Protector',
  'Broom of Flying':'Escoba Voladora','Cantrip Spellwrought Tattoo':'Tatuaje de Truco Mágico',
  'Cloak of Billowing':'Capa Ondulante','Cloak of Displacement':'Capa de Desplazamiento',
  'Cloak of Elvenkind':'Capa Élvica','Cloak of Protection':'Capa de Protección',
  'Cube of Force':'Cubo de Fuerza','Dust of Disappearance':'Polvo de Desaparición',
  'Eyes of the Eagle':'Ojos de Águila','Flame Tongue':'Lengua de Llama',
  'Gauntlets of Ogre Power':'Guanteletes de Poder de Ogro','Gem of Seeing':'Gema de la Visión',
  'Gloves of Missile Snaring':'Guantes Atrapa Proyectiles','Goggles of Night':'Gafas Nocturnas',
  'Hat of Disguise':'Sombrero del Disfraz','Headband of Intellect':'Diadema del Intelecto',
  'Helm of Comprehending Languages':'Yelmo para Comprender Idiomas',
  'Horseshoes of Speed':'Herraduras de Velocidad','Immovable Rod':'Vara Inamovible',
  'Ioun Stone (Awareness)':'Piedra de Ioun (Percepción)','Lantern of Revealing':'Linterna de Revelación',
  'Necklace of Fireballs':'Collar de Bolas de Fuego','Orb of Direction':'Orbe de Dirección',
  'Pearl of Power':'Perla del Poder','Portable Hole':'Agujero Portátil',
  'Pot of Awakening':'Olla del Despertar','Ring of Feather Falling':'Anillo de Caída de Pluma',
  'Ring of Jumping':'Anillo de Salto','Ring of Mind Shielding':'Anillo de Escudo Mental',
  'Ring of Protection':'Anillo de Protección','Ring of Regeneration':'Anillo de Regeneración',
  'Ring of Spell Storing':'Anillo de Almacenamiento de Conjuros','Ring of Swimming':'Anillo de Natación',
  'Ring of Warmth':'Anillo de Calor','Ring of X-Ray Vision':'Anillo de Visión Penetrante',
  'Robe of Useful Items':'Túnica de Objetos Útiles','Rope of Climbing':'Cuerda Trepadora',
  'Stone of Good Luck (Luckstone)':'Piedra de la Buena Suerte','Wand of Magic Missiles':'Varita de Misiles Mágicos',
  'Wand of Secrets':'Varita de los Secretos',
};

// ─── Damage type translations ─────────────────────────────────────────────────
export const DAMAGE_ES: Record<string, string> = {
  bludgeoning:'Contundente', piercing:'Perforante', slashing:'Cortante', fire:'Fuego', radiant:'Radiante',
  poison:'Veneno', acid:'Ácido', cold:'Frío', lightning:'Relámpago', thunder:'Trueno', force:'Fuerza',
};

// ─── Item image assets ────────────────────────────────────────────────────────
export const ITEM_IMAGE_BASE = 'src/images/items/';
const ITEM_IMAGE_ASSET_URLS = import.meta.glob('../images/items/*', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>;

export const ITEM_IMAGE_BY_NAME: Record<string, string> = {
  'Backpack': 'mochila 1.png',
  'Battleaxe': 'hacha de guerra 1.png',
  'Chain Mail': 'cota de malla 1.png',
  'Club': 'garrote 2 1.png',
  'Dagger': 'daga 1.png',
  'Dart': 'dardo 1.png',
  'Flail': 'mayal  1.png',
  'Glaive': 'guadaña 1.png',
  'Greataxe': 'gran hacha 1.png',
  'Halberd': 'alabarda 1.png',
  'Handaxe': 'hacha de mano 1.png',
  'Javelin': 'Jabalina 1.png',
  'Leather Armor': 'Armadura de cuero 1.png',
  'Light Crossbow': 'ballesta 1.png',
  'Longsword': 'Espada Larga 1.png',
  'Mace': 'maza 1.png',
  'Morningstar': 'estrella del alba 2 1.png',
  'Pike': 'Pica 1.png',
  'Potion of Healing': 'poción curativa 1.png',
  'Pouch': 'bolsa 1.png',
  'Quarterstaff': 'báculo 1.png',
  'Rapier': 'estoque 2 1.png',
  'Scimitar': 'Cimitarra 1.png',
  'Shield': 'Escudo 1.png',
  'Shortbow': 'arco corto 1.png',
  'Shortsword': 'espada corta 1.png',
  'Sling': 'honda  1.png',
  'Trident': 'tridente 2 1.png',
  'War Pick': 'pico de guerra 2 1.png',
  'Warhammer': 'Martillo de guerra 1.png',
};

export const ITEM_IMAGE_BY_KIND: Array<{ keys: string[]; files: string[] }> = [
  { keys: ['longsword', 'long sword'], files: ['Espada Larga 1.png', 'espada larga 2 1.png', 'Espada larga 4 1.png'] },
  { keys: ['shortsword', 'short sword'], files: ['espada corta 1.png'] },
  { keys: ['scimitar'], files: ['Cimitarra 1.png', 'cimitarra 2 1.png', 'cimitarra 3 1.png'] },
  { keys: ['rapier'], files: ['estoque 2 1.png', 'estoque 3.png'] },
  { keys: ['dagger'], files: ['daga 1.png', 'daga 2 1.png', 'daga 3 1.png'] },
  { keys: ['warhammer', 'hammer'], files: ['Martillo de guerra 1.png', 'martillo de guerra 2 1.png', 'Martillo de guerra 3 1.png'] },
  { keys: ['pike'], files: ['Pica 1.png', 'pica 2 1.png', 'pica 3 1.png', 'pica 5 1.png'] },
  { keys: ['war pick', 'pick'], files: ['pico de guerra 2 1.png', 'pico de guerra 3.png'] },
  { keys: ['morningstar', 'morning star'], files: ['estrella del alba 2 1.png', 'estrella del alba 3.png'] },
  { keys: ['trident'], files: ['tridente 2 1.png', 'tridente  3.png'] },
  { keys: ['crossbow'], files: ['ballesta 1.png'] },
  { keys: ['shortbow', 'bow'], files: ['arco corto 1.png'] },
  { keys: ['glaive', 'sickle', 'scythe'], files: ['guadaña 1.png'] },
  { keys: ['halberd'], files: ['alabarda 1.png'] },
  { keys: ['handaxe'], files: ['hacha de mano 1.png'] },
  { keys: ['battleaxe'], files: ['hacha de guerra 1.png'] },
  { keys: ['greataxe'], files: ['gran hacha 1.png'] },
  { keys: ['club'], files: ['garrote 2 1.png', 'garrote 3.png'] },
  { keys: ['amulet', 'medallion', 'medallón'], files: ['medallón 2 1.png', 'medallón 3.png'] },
];

export const GAME_ICON_BY_KIND: Array<{ keys: string[]; icon: string }> = [
  { keys: ['longsword', 'long sword', 'greatsword', 'great sword', 'shortsword', 'short sword', 'sword'], icon: 'crossed-swords' },
  { keys: ['rapier'], icon: 'spiral-thrust' },
  { keys: ['scimitar'], icon: 'curved-sword' },
  { keys: ['dagger', 'knife'], icon: 'plain-dagger' },
  { keys: ['battleaxe', 'handaxe', 'greataxe', 'axe'], icon: 'battle-axe' },
  { keys: ['warhammer', 'hammer', 'mace', 'maul'], icon: 'warhammer' },
  { keys: ['morningstar', 'flail'], icon: 'spiked-mace' },
  { keys: ['pike', 'spear', 'javelin', 'lance', 'trident'], icon: 'spear-hook' },
  { keys: ['halberd', 'glaive', 'polearm'], icon: 'halberd' },
  { keys: ['bow', 'longbow', 'shortbow'], icon: 'bow-arrow' },
  { keys: ['crossbow'], icon: 'crossbow' },
  { keys: ['sling'], icon: 'sling' },
  { keys: ['shield'], icon: 'round-shield' },
  { keys: ['armor', 'mail', 'plate', 'leather armor'], icon: 'breastplate' },
  { keys: ['arrow', 'arrows'], icon: 'arrow-flights' },
  { keys: ['bolt', 'bolts'], icon: 'crossbow' },
  { keys: ['potion', 'vial', 'elixir'], icon: 'potion-ball' },
  { keys: ['scroll', 'spellbook', 'book'], icon: 'scroll-unfurled' },
  { keys: ['wand'], icon: 'crystal-wand' },
  { keys: ['staff', 'quarterstaff'], icon: 'wood-stick' },
  { keys: ['ring'], icon: 'ring' },
  { keys: ['amulet', 'medallion', 'brooch', 'necklace'], icon: 'emerald-necklace' },
  { keys: ['boots'], icon: 'boots' },
  { keys: ['cloak', 'cape'], icon: 'cloak' },
  { keys: ['gloves', 'gauntlets'], icon: 'gloves' },
  { keys: ['backpack', 'pack'], icon: 'knapsack' },
  { keys: ['pouch', 'bag', 'sack'], icon: 'swap-bag' },
  { keys: ['rope'], icon: 'rope-coil' },
  { keys: ['torch', 'lantern'], icon: 'torch' },
  { keys: ['tool', 'tools', 'hammer'], icon: 'hammer-nails' },
  { keys: ['instrument', 'lute', 'flute', 'drum'], icon: 'lyre' },
  { keys: ['food', 'rations'], icon: 'meal' },
  { keys: ['coin', 'gold'], icon: 'two-coins' },
];

// ─── Rarity themes ────────────────────────────────────────────────────────────
export const ITEM_RARITY_THEME: Record<string, RarityTheme> = {
  common:    { color: '#D8D8D8', bg: '#F5F5F2', label: 'Común' },
  uncommon:  { color: '#6FBF73', bg: '#EAF7EA', label: 'Poco común' },
  rare:      { color: '#62B6E8', bg: '#E7F5FF', label: 'Raro' },
  very_rare: { color: '#9B7BEA', bg: '#F0EAFE', label: 'Muy raro' },
  legendary: { color: '#E2A241', bg: '#FFF2D9', label: 'Legendario' },
  artifact:  { color: '#D75B74', bg: '#FFE9EE', label: 'Artefacto' },
};
export const ITEM_DEFAULT_THEME: RarityTheme = { color: '#EED3B1', bg: '#4D2C1C', label: '' };
export const ITEM_ICON_BRAND_COLOR = '#720000';
export const ITEM_ICON_BRAND_BG = 'rgba(114,0,0,.10)';

// ─── Inventory filter labels ──────────────────────────────────────────────────
export const INVENTORY_FILTER_LABELS: Record<string, string> = {
  weapon:     'Armas',
  armor:      'Armaduras',
  consumable: 'Consumibles',
  ammunition: 'Municiones',
  gear:       'Baratija',
  curiosity:  'Curiosidad',
  clothing:   'Ropa',
  tool:       'Arte',
};

// ═══════════════════════════════════════════════════════════════════════════════
// Item label / type helpers
// ═══════════════════════════════════════════════════════════════════════════════

/** Returns the Spanish display label for an item name, stripping quantity suffixes. */
export function itemLabel(name: unknown): string {
  const raw = String(name ?? '');
  const cleanName = raw.replace(/\s*\(\d+\)\s*$/, '');
  return ITEM_NAME_ES[raw] ?? ITEM_NAME_ES[cleanName] ?? cleanName;
}

/** Spanish label for an armor category key. */
export function armorCategoryLabel(category: unknown): string {
  const map: Record<string, string> = { light:'Ligera', medium:'Media', heavy:'Pesada', shield:'Escudo' };
  return map[String(category ?? '')] ?? String(category ?? '');
}

/** Whether the weapon is a ranged or melee type. */
export function weaponFamily(item: CatalogItem | null | undefined): string {
  const props = item?.properties ?? {};
  if (props.ammunition) return 'A distancia';
  if (props.range_normal && !props.thrown) return 'A distancia';
  if (props.thrown) return 'Cuerpo a cuerpo / arrojadiza';
  return 'Cuerpo a cuerpo';
}

const SIMPLE_WEAPONS = new Set([
  'Club','Dagger','Greatclub','Handaxe','Javelin','Light Hammer',
  'Mace','Quarterstaff','Sickle','Spear','Dart','Light Crossbow','Shortbow','Sling',
]);

/** Whether the weapon is 'Simple' or 'Marcial'. */
export function weaponTraining(item: CatalogItem | null | undefined): string {
  return SIMPLE_WEAPONS.has(item?.name ?? '') ? 'Simple' : 'Marcial';
}

/** Spanish label for an ammunition weapon-type key. */
export function ammoWeaponLabel(type: unknown): string {
  const map: Record<string, string> = { bow:'arcos', crossbow:'ballestas', sling:'hondas', blowgun:'cerbatanas' };
  return map[String(type ?? '')] ?? 'armas compatibles';
}

/** Extracts the Spanish label for a single weapon property key-value pair. */
export function propertyLabel(key: string, value: unknown): string {
  const map: Record<string, string> = {
    ammunition:'Munición', finesse:'Sutileza', heavy:'Pesada', light:'Ligera', loading:'Recarga',
    reach:'Alcance adicional', special:'Especial', thrown:'Arrojadiza', two_handed:'A dos manos',
    versatile:'Versátil',
  };
  if (key === 'versatile_damage') return `Versátil ${value}`;
  if (key === 'range_normal') return '';
  if (key === 'range_long') return '';
  return value === true ? (map[key] ?? '') : '';
}

/** Full item-type label with weapon sub-info (weapon training, family). */
export function itemTypeLabel(item: CatalogItem | null | undefined): string {
  if (!item) return 'Equipo';
  const map: Record<string, string> = {
    weapon:'Arma', armor:'Armadura', pack:'Equipo', gear:'Equipo', tool:'Herramienta',
    ammunition:'Munición', clothing:'Vestimenta', focus:'Foco', instrument:'Instrumento',
    potion:'Poción', magic_item:'Objeto mágico',
  };
  if (item.item_type === 'weapon' && item.damage_dice) {
    return `Arma ${weaponTraining(item).toLowerCase()} · ${weaponFamily(item)}`;
  }
  if (item.item_type === 'armor') {
    return item.armor_category === 'shield'
      ? 'Escudo'
      : `Armadura ${armorCategoryLabel(item.armor_category).toLowerCase()}`;
  }
  if (item.item_type === 'ammunition') {
    const ammoType = item.properties?.weapon_type ?? '';
    if (ammoType === 'bow') return 'Munición para arco';
    if (ammoType === 'crossbow') return 'Munición para ballesta';
    if (ammoType === 'sling') return 'Munición para honda';
    if (ammoType === 'blowgun') return 'Munición para cerbatana';
    return 'Munición';
  }
  return map[item.item_type ?? ''] ?? item.item_type ?? 'Equipo';
}

/** Attack category label used in the dice-flow attack panel. */
export function itemAttackCategory(item: CatalogItem | null | undefined): string {
  const props = item?.properties ?? {};
  if (props.ammunition || props.range_normal) return `Arma ${weaponFamily(item).toLowerCase()}`;
  return `Arma ${weaponFamily(item).toLowerCase()} ${weaponTraining(item).toLowerCase()}`;
}

/** Short preview of pack contents for display in selection cards. */
export function packContentsPreview(item: CatalogItem | null | undefined): string[] {
  const contents = item?.pack_contents ?? [];
  if (!Array.isArray(contents)) return [];
  return contents.slice(0, 12).map(entry => {
    const qty = entry.qty ?? entry.quantity ?? 1;
    const name = itemLabel(entry.item ?? entry.item_id ?? 'Objeto');
    return `${qty}x ${name}`;
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Ammunition helpers
// ═══════════════════════════════════════════════════════════════════════════════

/** Returns the bundle size encoded in an item name, e.g. "Arrows (20)" → 20. */
export function ammunitionBundleSize(itemOrName: CatalogItem | string | null | undefined): number {
  const name = typeof itemOrName === 'string' ? itemOrName : itemOrName?.name;
  const match = String(name ?? '').match(/\((\d+)\)$/);
  return match ? Number(match[1]) : 0;
}

/** Display quantity for an inventory entry (trivial now, extensible later). */
export function inventoryDisplayQuantity(inv: InventoryEntry, _item: CatalogItem | null | undefined): number {
  return inv.quantity ?? 1;
}

/** Returns the ammo-type string from an equipped ranged weapon entry. */
export function inventoryWeaponAmmoType(inv: InventoryEntry | null | undefined): string {
  const name = String(inv?.item?.name ?? '').toLowerCase();
  if (name.includes('crossbow')) return 'crossbow';
  if (name.includes('bow')) return 'bow';
  if (name.includes('sling')) return 'sling';
  if (name.includes('blowgun')) return 'blowgun';
  return '';
}

/** Returns the ammo-type string from an ammunition inventory entry. */
export function inventoryAmmoType(inv: InventoryEntry | null | undefined): string {
  return inv?.item?.properties?.weapon_type ?? '';
}

/** Spanish singular noun for one unit of an ammo stack. */
export function ammoSingularName(item: CatalogItem | null | undefined): string {
  const name = itemLabel(item?.name ?? 'Munición').toLowerCase();
  if (name.includes('virote')) return 'virote';
  if (name.includes('flecha')) return 'flecha';
  if (name.includes('bala')) return 'bala';
  if (name.includes('aguja')) return 'aguja';
  return 'unidad';
}

// ═══════════════════════════════════════════════════════════════════════════════
// Item classification helpers
// ═══════════════════════════════════════════════════════════════════════════════

const USABLE_BY_NAME = new Set([
  'Rations (1 day)', 'Torch', 'Candle', 'Oil (flask)',
  'Holy Water (flask)', 'Acid (vial)', "Alchemist's Fire",
  'Antitoxin (vial)', 'Basic Poison (vial)',
]);

/** Whether the item can be equipped (weapon, ammunition, or armored piece). */
export function isUiEquippable(item: CatalogItem | null | undefined): boolean {
  return item?.item_type === 'weapon'
    || item?.item_type === 'ammunition'
    || (item?.item_type === 'armor' && !!item?.armor_category);
}

/** Whether the item can be "used" (potions, consumables, etc.). */
export function isUiUsable(item: CatalogItem | null | undefined): boolean {
  if (!item) return false;
  const props = item.properties ?? {};
  if (item.item_type === 'potion') return true;
  if (props.heal_dice || props.damage_dice || props.effect) return true;
  return USABLE_BY_NAME.has(item.name ?? '');
}

/** Dice formula string for a usable item, or '' if none. */
export function itemUseDiceFormula(item: CatalogItem | null | undefined): string {
  const props = item?.properties ?? {};
  if (props.heal_dice) return `${props.heal_dice}${props.heal_bonus ? `+${props.heal_bonus}` : ''}`;
  if (props.damage_dice) return `${props.damage_dice}`;
  if (item?.name === 'Potion of Poison') return '3d6';
  return '';
}

/** Category key used for inventory filtering. */
export function inventoryItemCategory(item: CatalogItem | null | undefined): string {
  if (!item) return 'gear';
  if (item.item_type === 'weapon') return 'weapon';
  if (item.item_type === 'armor') return 'armor';
  if (item.item_type === 'ammunition') return 'ammunition';
  if (item.item_type === 'potion' || isUiUsable(item)) return 'consumable';
  if (item.item_type === 'clothing') return 'clothing';
  if (item.item_type === 'magic_item') return 'curiosity';
  if (['tool', 'instrument', 'focus'].includes(item.item_type ?? '')) return 'tool';
  return 'gear';
}

// ═══════════════════════════════════════════════════════════════════════════════
// Item chips / rule summary helpers
// ═══════════════════════════════════════════════════════════════════════════════

/** Full array of descriptive chip strings for an item. */
export function itemRuleChips(item: CatalogItem | null | undefined): string[] {
  if (!item) return [];
  const props = item.properties ?? {};
  const chips: string[] = [];

  if (item.item_type === 'weapon') {
    chips.push(`Arma ${weaponTraining(item).toLowerCase()}`);
    chips.push(weaponFamily(item));
    if (item.damage_dice) {
      chips.push(`Daño ${item.damage_dice} ${DAMAGE_ES[item.damage_type ?? ''] ?? item.damage_type ?? ''}`.trim());
    }
  }
  if (item.item_type === 'armor') {
    chips.push(
      item.armor_category === 'shield'
        ? 'Escudo'
        : `Armadura ${armorCategoryLabel(item.armor_category).toLowerCase()}`,
    );
    if (item.ac_base) {
      chips.push(
        item.armor_category === 'shield'
          ? `CA +${item.ac_base}`
          : `CA ${item.ac_base}${item.armor_category === 'heavy' ? '' : ' + DES'}`,
      );
    }
  }
  if (item.item_type === 'ammunition') {
    const ammoType = props.weapon_type;
    chips.push('Munición');
    if (ammoType) chips.push(`Para ${ammoWeaponLabel(ammoType)}`);
  }
  if (props.heal_dice) chips.push(`Curación ${props.heal_dice}${props.heal_bonus ? `+${props.heal_bonus}` : ''}`);
  if (props.damage_dice) chips.push(`Uso ${props.damage_dice} ${DAMAGE_ES[props.damage_type ?? ''] ?? props.damage_type ?? ''}`.trim());
  if (props.duration) chips.push(`Duración ${props.duration}`);
  if (props.range_normal) chips.push(`Alcance ${props.range_normal}/${props.range_long ?? props.range_normal} ft`);

  Object.entries(props).forEach(([key, value]) => {
    const label = propertyLabel(key, value);
    if (label) chips.push(label);
  });

  if (item.strength_requirement) chips.push(`FUE ${item.strength_requirement}`);
  if (item.stealth_disadvantage) chips.push('Sigilo con desventaja');
  if (item.weight) chips.push(`Peso ${item.weight} lb`);
  if (item.cost_gp !== undefined) chips.push(`Valor ${item.cost_gp} PO`);
  if (item.requires_attunement) chips.push('Requiere sintonía');

  return [...new Set(chips.filter(Boolean))];
}

/** HTML string of up to 7 chip spans for an item. */
export function itemChips(item: CatalogItem | null | undefined): string {
  return itemRuleChips(item)
    .slice(0, 7)
    .map(chip => `<span class="equip-chip">${chip}</span>`)
    .join('');
}

/** Detail-row pairs [[label, value]] shown inside an inventory card body. */
export function inventoryCardRows(item: CatalogItem | null | undefined): [string, string][][] {
  const props = item?.properties ?? {};
  const damageParts: string[] = [];
  if (item?.damage_dice) {
    damageParts.push(`${item.damage_dice} ${DAMAGE_ES[item.damage_type ?? ''] ?? item.damage_type ?? ''}`.trim());
  }
  if (props.damage_dice) {
    damageParts.push(`${props.damage_dice} ${DAMAGE_ES[props.damage_type ?? ''] ?? props.damage_type ?? ''}`.trim());
  }

  const attrParts = itemRuleChips(item)
    .filter(chip => !chip.startsWith('Daño ') && !chip.startsWith('Uso ') && !chip.startsWith('Peso ') && !chip.startsWith('Valor '))
    .slice(0, 5);

  const row1: [string, string][] = [];
  if (damageParts.length) row1.push(['Daño', [...new Set(damageParts)].join(', ')]);
  if (attrParts.length) row1.push(['Atributo', attrParts.join(', ')]);

  const row2: [string, string][] = [];
  if (item?.cost_gp !== undefined && item?.cost_gp !== null) {
    row2.push(['Precio', `${Number(item.cost_gp).toLocaleString('es-MX')} PO`]);
  }
  if (item?.weight !== undefined && item?.weight !== null) {
    row2.push(['Peso', `${item.weight}lb`]);
  }

  return ([row1, row2] as [string, string][][]).filter(row => row.length > 0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Item description helpers
// ═══════════════════════════════════════════════════════════════════════════════

/** Full Spanish description for an item (auto-generated if none stored). */
export function itemDescription(item: CatalogItem | null | undefined): string {
  if (!item) return 'Objeto de equipo inicial.';
  const props = item.properties ?? {};

  if (item.description) return item.description;
  if (props.description) return String(props.description);

  if (item.item_type === 'pack') {
    const contents = packContentsPreview(item);
    return contents.length
      ? `Incluye: ${contents.join(', ')}.`
      : 'Paquete de aventurero que se desglosa en objetos y cantidades al agregarse.';
  }

  if (item.item_type === 'weapon') {
    const range = props.range_normal
      ? ` Tiene alcance ${props.range_normal}/${props.range_long ?? props.range_normal} pies.`
      : '';
    const properties = itemRuleChips(item)
      .filter(c => !c.startsWith('Daño') && !c.startsWith('Peso') && !c.startsWith('Valor'))
      .join(', ');
    const family = weaponFamily(item).toLowerCase();
    const familyText = family === 'a distancia' ? 'a distancia' : `de ${family}`;
    return `${itemLabel(item.name)} es un arma ${weaponTraining(item).toLowerCase()} ${familyText}${item.damage_dice ? ` que inflige ${item.damage_dice} de daño ${DAMAGE_ES[item.damage_type ?? ''] ?? item.damage_type}` : ''}.${range}${properties ? ` Propiedades: ${properties}.` : ''}`;
  }
  if (item.item_type === 'armor') {
    if (item.armor_category === 'shield') {
      return `Escudo defensivo que ocupa una mano y suma +${item.ac_base ?? 2} a la clase de armadura mientras está equipado.`;
    }
    const dexRule = item.armor_category === 'heavy'
      ? 'no suma Destreza'
      : item.armor_category === 'medium'
        ? 'suma Destreza hasta un máximo de +2'
        : 'suma el modificador completo de Destreza';
    const req = item.strength_requirement ? ` Requiere Fuerza ${item.strength_requirement} para moverse sin penalización.` : '';
    const stealth = item.stealth_disadvantage ? ' Impone desventaja en pruebas de Sigilo.' : '';
    return `Armadura ${armorCategoryLabel(item.armor_category).toLowerCase()} con CA base ${item.ac_base}; ${dexRule}.${req}${stealth}`;
  }
  if (item.item_type === 'ammunition') {
    const bundle = ammunitionBundleSize(item);
    const count = bundle ? ` El paquete representa ${bundle} unidades.` : '';
    return `Munición consumible compatible con ${ammoWeaponLabel(props.weapon_type)}. Debe coincidir con el arma a distancia equipada para poder usarse.${count}`;
  }
  if (item.item_type === 'potion') return 'Consumible mágico. Al usarlo se aplica su efecto y se descuenta una unidad del inventario.';
  if (item.item_type === 'focus') return 'Foco de lanzamiento de conjuros. Permite canalizar componentes materiales cuando la clase correspondiente lo permite.';
  if (item.item_type === 'tool' || item.item_type === 'instrument') return 'Herramienta de competencia para pruebas específicas, oficio, interpretación o escenas de exploración y rol.';
  if (props.damage_dice || props.effect) {
    return `Objeto utilizable. ${props.damage_dice ? `Puede provocar ${props.damage_dice} de daño ${DAMAGE_ES[props.damage_type ?? ''] ?? props.damage_type ?? ''}.` : ''}${props.effect ? ` Efecto: ${props.effect}.` : ''}`;
  }
  return 'Objeto de aventura útil para exploración, descanso, transporte, rol o resolución de situaciones en la partida.';
}

// ─── Item drawer helpers ──────────────────────────────────────────────────────

/** Formatted price string for the item description drawer. */
export function itemDrawerPrice(item: CatalogItem | null | undefined): string {
  const value = Number(item?.cost_gp ?? 0);
  if (!Number.isFinite(value) || value <= 0) return '—';
  return value.toLocaleString('es-MX');
}

/** Up to 5 key-value meta rows for the item description drawer. */
export function itemDrawerMetaRows(item: CatalogItem | null | undefined): [string, unknown][] {
  const rows: [string, unknown][] = [];
  if (item?.damage_dice) rows.push(['Daño', `${item.damage_dice} ${DAMAGE_ES[item.damage_type ?? ''] ?? item.damage_type ?? ''}`.trim()]);
  if (item?.armor_category) rows.push(['Armadura', armorCategoryLabel(item.armor_category)]);
  if (item?.ac_base) rows.push(['CA base', item.ac_base]);
  if (item?.weight) rows.push(['Peso', `${item.weight} lb`]);
  if (item?.requires_attunement) rows.push(['Sintonía', 'Requerida']);
  const props = item?.properties ?? {};
  if (props.weapon_type) rows.push(['Tipo', ammoWeaponLabel(props.weapon_type)]);
  if (props.range_normal) rows.push(['Alcance', `${props.range_normal}/${props.range_long ?? props.range_normal} pies`]);
  if (props.heal_dice) rows.push(['Curación', `${props.heal_dice}${props.heal_bonus ? `+${props.heal_bonus}` : ''}`]);
  return rows.slice(0, 5);
}

/** Translates common English rule terms to Spanish in a rule text string. */
export function itemDrawerRuleText(value: unknown): string {
  return String(value ?? '')
    .replace(/\badvantage on\b/gi, 'tiradas de')
    .replace(/\badvantage in\b/gi, 'tiradas de')
    .replace(/\bimmunity to\b/gi, 'inmune contra')
    .replace(/\bimmune to\b/gi, 'inmune contra')
    .replace(/\bfire damage\b/gi, 'daño de fuego')
    .replace(/\bpoison damage\b/gi, 'daño de veneno')
    .replace(/\bcold damage\b/gi, 'daño de frío')
    .replace(/\blightning damage\b/gi, 'daño de relámpago')
    .replace(/\bIntimidation\b/g, 'intimidación')
    .replace(/\bStealth\b/g, 'sigilo')
    .replace(/\bPerception\b/g, 'percepción')
    .replace(/\bInvestigation\b/g, 'investigación')
    .replace(/\bAthletics\b/g, 'atletismo')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Derives the rule label+value pair shown in the item description drawer. */
export function itemDrawerRule(item: CatalogItem | null | undefined, chips: string[] = []): DrawerRule {
  const props = item?.properties ?? {};
  const explicitAdvantage = props.advantage ?? props.ventaja;
  const explicitImmunity = props.immunity ?? props.immune ?? props.inmune;
  const text = [props.effect, props.description, item?.description].filter(Boolean).join(' ');
  const values: string[] = [];

  if (explicitAdvantage) values.push(itemDrawerRuleText(explicitAdvantage));
  const advantageMatch = text.match(/(?:Ventaja en|advantage on)\s+([^.;]+)/i);
  if (advantageMatch) values.push(itemDrawerRuleText(advantageMatch[1]));
  if (explicitImmunity) values.push(itemDrawerRuleText(`inmune contra ${explicitImmunity}`));
  const immunityMatch = text.match(/(?:inmune(?: contra| a)?|immune to|immunity to)\s+([^.;]+)/i);
  if (immunityMatch) values.push(itemDrawerRuleText(`inmune contra ${immunityMatch[1]}`));

  const uniqueValues = [...new Set(values.filter(Boolean))];
  if (uniqueValues.length) {
    return { label: 'Ventaja', value: uniqueValues.join(', ') };
  }
  const attr = chips
    .filter(chip => !/^Peso\b/i.test(chip) && !/^Valor\b/i.test(chip))
    .join(', ');
  return {
    label: 'Atributo',
    value: attr || itemTypeLabel(item),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Item image helpers
// ═══════════════════════════════════════════════════════════════════════════════

/** Normalises a string for fuzzy image key matching. */
export function itemImageKey(value: unknown): string {
  return String(value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Picks a file from a list deterministically by hashing the seed string. */
export function pickItemImage(files: string | string[], seed: unknown): string {
  if (!Array.isArray(files)) return files;
  if (!files.length) return '';
  const text = itemImageKey(seed);
  const hash = [...text].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return files[hash % files.length];
}

/** Resolves an item image filename through Vite so production builds include it. */
export function itemImageAssetUrl(filename: string): string {
  const match = Object.entries(ITEM_IMAGE_ASSET_URLS)
    .find(([path]) => path.endsWith(`/${filename}`));
  return match?.[1] ?? `${ITEM_IMAGE_BASE}${filename}`;
}

/** Returns a local image path for the item, or '' if none is configured. */
export function itemImagePath(item: CatalogItem | null | undefined): string {
  if (!item?.name) return '';
  const exact = ITEM_IMAGE_BY_NAME[item.name];
  if (exact) return itemImageAssetUrl(exact);
  const props = item.properties ?? {};
  const haystack = itemImageKey(`${item.name} ${props.weapon_type ?? ''} ${item.item_type ?? ''}`);
  const match = ITEM_IMAGE_BY_KIND.find(group => group.keys.some(key => haystack.includes(key)));
  if (!match) return '';
  return itemImageAssetUrl(pickItemImage(match.files, item.name));
}

/** Normalised rarity key for an item (e.g. 'common', 'rare', 'very_rare'). */
export function itemRarity(item: CatalogItem | null | undefined): string {
  const raw = item?.properties?.rarity ?? item?.rarity ?? '';
  return String(raw).toLowerCase().replace(/[\s-]+/g, '_');
}

/** Returns the rarity theme (color + bg + label) for an item. */
export function itemArtTheme(item: CatalogItem | null | undefined): RarityTheme {
  return ITEM_RARITY_THEME[itemRarity(item)] ?? ITEM_DEFAULT_THEME;
}

/** Returns the game-icons.net slug that best matches the item. */
export function gameIconSlug(item: CatalogItem | null | undefined): string {
  if (!item) return 'swap-bag';
  const props = item.properties ?? {};
  const haystack = itemImageKey(
    `${item.name ?? ''} ${props.weapon_type ?? ''} ${item.item_type ?? ''} ${item.armor_category ?? ''}`,
  );
  const match = GAME_ICON_BY_KIND.find(group => group.keys.some(key => haystack.includes(key)));
  if (match) return match.icon;
  if (item.item_type === 'weapon') return 'crossed-swords';
  if (item.item_type === 'armor') return item.armor_category === 'shield' ? 'round-shield' : 'breastplate';
  if (item.item_type === 'ammunition') return 'arrow-flights';
  if (item.item_type === 'potion') return 'potion-ball';
  if (item.item_type === 'magic_item') return 'magic-swirl';
  if (item.item_type === 'tool') return 'hammer-nails';
  if (item.item_type === 'instrument') return 'lyre';
  return 'swap-bag';
}

/** Returns a local SVG data URL for critical fallback icons that must work offline. */
export function localGameIconPath(slug: string, color: string): string {
  if (slug !== 'ring') return '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="37" r="17" stroke="${color}" stroke-width="5"/><path d="M22 20h20l-5 10H27l-5-10Z" stroke="${color}" stroke-width="5" stroke-linejoin="round"/><path d="M27 20l5-8 5 8" stroke="${color}" stroke-width="5" stroke-linejoin="round"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Returns the Iconify API URL for an item's game-icon with the brand colour. */
export function gameIconPath(item: CatalogItem | null | undefined): string {
  const slug = gameIconSlug(item);
  const color = encodeURIComponent(ITEM_ICON_BRAND_COLOR);
  return localGameIconPath(slug, ITEM_ICON_BRAND_COLOR)
    || `https://api.iconify.design/game-icons:${slug}.svg?color=${color}`;
}

/** Returns a complete <figure> HTML string for an item's art image. */
export function itemImageHtml(item: CatalogItem | null | undefined, altText?: string): string {
  if (!item) return '';
  const theme = itemArtTheme(item);
  const localPath = itemImagePath(item);
  const path = localPath ? encodeURI(localPath) : gameIconPath(item);
  const fallbackPath = localPath ? escapeText(gameIconPath(item)) : '';
  const sourceClass = localPath ? 'local' : 'library';
  const artColor = localPath ? theme.color : ITEM_ICON_BRAND_COLOR;
  const artBg = localPath ? theme.bg : ITEM_ICON_BRAND_BG;
  const rarity = itemRarity(item);
  const label = rarity && theme.label ? `<span>${escapeText(theme.label)}</span>` : '';
  const alt = escapeText(altText ?? itemLabel(item.name));
  const onError = fallbackPath
    ? `this.onerror=null;this.src='${fallbackPath}';this.closest('.item-art')?.classList.remove('local');this.closest('.item-art')?.classList.add('library');this.closest('.item-art')?.style.setProperty('--item-art-color','${ITEM_ICON_BRAND_COLOR}');this.closest('.item-art')?.style.setProperty('--item-art-bg','${ITEM_ICON_BRAND_BG}')`
    : `this.closest('.item-art')?.classList.add('image-missing')`;
  return `<figure class="item-art ${sourceClass}" style="--item-art-color:${artColor};--item-art-bg:${artBg}" title="${escapeText(theme.label || 'Objeto')}"><img src="${escapeText(path)}" alt="${alt}" loading="lazy" onerror="${onError}">${label}</figure>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Window exposure
// ═══════════════════════════════════════════════════════════════════════════════

export const inventoryHelpers = {
  // constants
  ITEM_NAME_ES,
  DAMAGE_ES,
  ITEM_IMAGE_BASE,
  ITEM_IMAGE_BY_NAME,
  ITEM_IMAGE_BY_KIND,
  GAME_ICON_BY_KIND,
  ITEM_RARITY_THEME,
  ITEM_DEFAULT_THEME,
  ITEM_ICON_BRAND_COLOR,
  ITEM_ICON_BRAND_BG,
  INVENTORY_FILTER_LABELS,
  // label / type
  itemLabel,
  armorCategoryLabel,
  weaponFamily,
  weaponTraining,
  ammoWeaponLabel,
  propertyLabel,
  itemTypeLabel,
  itemAttackCategory,
  packContentsPreview,
  // ammunition
  ammunitionBundleSize,
  inventoryDisplayQuantity,
  inventoryWeaponAmmoType,
  inventoryAmmoType,
  ammoSingularName,
  // classification
  isUiEquippable,
  isUiUsable,
  itemUseDiceFormula,
  inventoryItemCategory,
  // chips / rules
  itemRuleChips,
  itemChips,
  inventoryCardRows,
  // description
  itemDescription,
  itemDrawerPrice,
  itemDrawerMetaRows,
  itemDrawerRuleText,
  itemDrawerRule,
  // image
  itemImageKey,
  pickItemImage,
  itemImageAssetUrl,
  itemImagePath,
  itemRarity,
  itemArtTheme,
  gameIconSlug,
  localGameIconPath,
  gameIconPath,
  itemImageHtml,
};

declare global {
  interface Window {
    DND_ITEM_HELPERS?: typeof inventoryHelpers;
  }
}

if (typeof window !== 'undefined') {
  window.DND_ITEM_HELPERS = inventoryHelpers;
}
