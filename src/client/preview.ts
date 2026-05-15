// @ts-nocheck
// Legacy preview fixture extracted from ui.html during Phase 2.
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const PREVIEW_PROFILE = {
  id: 'preview-profile',
  display_name: 'Vista de prueba',
  email: 'sin login · datos demo locales',
};

const PREVIEW_LANGUAGES = [
  { language_id: 'common', name: 'Común', language_type: 'standard' },
  { language_id: 'elvish', name: 'Élfico', language_type: 'standard' },
  { language_id: 'draconic', name: 'Dracónico', language_type: 'exotic' },
];

const PREVIEW_ITEMS = [
  {
    item_id: 'longsword', name: 'Longsword', item_type: 'weapon', quantity: 1,
    weight: 3, cost_gp: 15, damage_dice: '1d8', damage_type: 'slashing',
    properties: { versatile: true, damage_versatile: '1d10' },
    description: 'Espada recta de una mano, equilibrada para defensa y ataque. Puede blandirse con dos manos para aumentar el daño cuando no se usa escudo.',
  },
  {
    item_id: 'shield', name: 'Shield', item_type: 'armor', armor_category: 'shield',
    weight: 6, cost_gp: 10, ac_base: 2,
    description: 'Escudo de madera reforzada y borde metálico. Ocupa una mano y aumenta la Clase de Armadura mientras esté equipado.',
  },
  {
    item_id: 'chain_mail', name: 'Chain Mail', item_type: 'armor', armor_category: 'heavy',
    weight: 55, cost_gp: 75, ac_base: 16, strength_requirement: 13, stealth_disadvantage: true,
    description: 'Armadura pesada formada por anillos metálicos entrelazados. Protege muy bien, pero su peso y ruido causan desventaja en tiradas de Sigilo.',
  },
  {
    item_id: 'shortbow', name: 'Shortbow', item_type: 'weapon',
    weight: 2, cost_gp: 25, damage_dice: '1d6', damage_type: 'piercing',
    properties: { ammunition: true, range_normal: 80, range_long: 320 },
    description: 'Arco compacto para ataques a distancia. Consume una flecha por ataque y permite mantener distancia sin perder movilidad.',
  },
  {
    item_id: 'arrows', name: 'Arrows (20)', item_type: 'ammunition',
    weight: 1, cost_gp: 1, properties: { weapon_type: 'bow' },
    description: 'Munición para arcos. Cada disparo consume una flecha si el ataque usa un arco equipado.',
  },
  {
    item_id: 'healing_potion', name: 'Potion of Healing', item_type: 'potion',
    weight: 0.5, cost_gp: 50, properties: { heal_dice: '2d4', heal_bonus: 2, rarity: 'common' },
    description: 'Líquido rojo brillante que recupera 2d4 + 2 puntos de golpe al beberlo. El resultado se suma a los PG actuales sin exceder el máximo.',
  },
  {
    item_id: 'backpack', name: 'Backpack', item_type: 'gear',
    weight: 5, cost_gp: 2,
    description: 'Mochila resistente para transportar raciones, herramientas, cuerda, antorchas y otros objetos de viaje.',
  },
  {
    item_id: 'rations', name: 'Rations (1 day)', item_type: 'gear',
    weight: 2, cost_gp: 0.5, properties: { consumable: true },
    description: 'Comida seca para un día de viaje: carne curada, fruta deshidratada, nueces y pan duro.',
  },
  {
    item_id: 'holy_symbol', name: 'Holy Symbol', item_type: 'focus',
    weight: 1, cost_gp: 5,
    description: 'Símbolo sagrado usado como foco para canalizar conjuros divinos y juramentos de paladín.',
  },
  {
    item_id: 'terrible_helm', name: 'Helm of Dread', item_type: 'magic_item',
    weight: 2, cost_gp: 100, properties: { rarity: 'rare', advantage: 'Tiradas de intimidación, inmune contra daño de fuego' },
    description: 'Un amenazante yelmo de acero. Su efecto es cosmético: hace que tus ojos brillen de un rojo intenso mientras lo llevas puesto.',
  },
];

const PREVIEW_SPELLS = [
  {
    id: 'preview-ks-bless', spell_id: 'bless', is_prepared: true,
    spell: {
      spell_id: 'bless', name: 'Bless', level: 1, school: 'enchantment',
      casting_time: '1 acción', range_ft: 30, duration: 'Concentración, hasta 1 minuto',
      components: ['V', 'S', 'M'], requires_concentration: true,
      description: 'Bendices hasta tres criaturas. Cuando una criatura bendecida haga una tirada de ataque o salvación, suma 1d4 al resultado.',
      effects: { targets: 3 },
    },
  },
  {
    id: 'preview-ks-cure-wounds', spell_id: 'cure_wounds', is_prepared: true,
    spell: {
      spell_id: 'cure_wounds', name: 'Cure Wounds', level: 1, school: 'evocation',
      casting_time: '1 acción', range: 'Touch', duration: 'Instantáneo',
      components: ['V', 'S'], requires_concentration: false,
      description: 'Una criatura que tocas recupera puntos de golpe. No afecta a muertos vivientes ni constructos.',
      effects: { heal: '1d8 + modificador de característica' },
    },
  },
  {
    id: 'preview-ks-divine-favor', spell_id: 'divine_favor', is_prepared: false,
    spell: {
      spell_id: 'divine_favor', name: 'Divine Favor', level: 1, school: 'evocation',
      casting_time: '1 acción bonus', range: 'Self', duration: 'Concentración, hasta 1 minuto',
      components: ['V', 'S'], requires_concentration: true,
      description: 'Tu arma irradia poder divino. Tus ataques con arma infligen 1d4 de daño radiante adicional.',
      effects: { damage: '1d4 radiant' },
    },
  },
];

const PREVIEW_CATALOG = {
  races: [
    { race_id: 'human', name: 'Human', base_speed: 30, ability_bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 } },
    { race_id: 'high_elf', name: 'High Elf', parent_race: 'Elf', base_speed: 30, ability_bonuses: { dex: 2, int: 1 } },
    { race_id: 'wood_elf', name: 'Wood Elf', parent_race: 'Elf', base_speed: 35, ability_bonuses: { dex: 2, wis: 1 } },
    { race_id: 'drow', name: 'Drow', parent_race: 'Elf', base_speed: 30, ability_bonuses: { dex: 2, cha: 1 } },
  ],
  classes: [
    {
      class_id: 'paladin', name: 'Paladin', hit_die: 10, subclass_level: 3, spellcasting_ability: 'cha',
      starting_skill_choices: { count: 2, pool: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'] },
      starting_cantrips_known: 0, starting_spells_known: 2,
    },
    {
      class_id: 'fighter', name: 'Fighter', hit_die: 10, subclass_level: 3,
      starting_skill_choices: { count: 2, pool: ['acrobatics', 'animal_handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'] },
      starting_cantrips_known: 0, starting_spells_known: 0,
    },
  ],
  backgrounds: [
    { background_id: 'noble', name: 'Noble', skill_proficiencies: ['history', 'persuasion'], tool_proficiencies: ['dragonchess_set'], languages: ['elvish'] },
    { background_id: 'soldier', name: 'Soldier', skill_proficiencies: ['athletics', 'intimidation'], tool_proficiencies: ['vehicles_land'], languages: [] },
  ],
  languages: PREVIEW_LANGUAGES,
};

function previewFindItem(ref) {
  const key = String(ref || '').toLowerCase();
  return PREVIEW_ITEMS.find(item => item.item_id === ref || item.name.toLowerCase() === key) ?? null;
}

function previewInventoryItem(itemId, quantity = 1, equipped = false) {
  const item = previewFindItem(itemId);
  return {
    item_id: item?.item_id ?? itemId,
    quantity,
    is_equipped: equipped,
    is_attuned: item?.requires_attunement ?? false,
    item,
  };
}

function previewComputed() {
  return {
    total_level: 2,
    proficiency_bonus: 2,
    speed: 30,
    armor_class: 18,
    unarmored_ac: 10,
    max_hp: 20,
    initiative: 0,
    hit_dice: [{ die_type: 10, max: 2, available: 2 }],
    ability_scores: { str: 16, dex: 10, con: 14, int: 10, wis: 12, cha: 16 },
    ability_modifiers: { str: 3, dex: 0, con: 2, int: 0, wis: 1, cha: 3 },
    saving_throw_proficiencies: ['wis', 'cha'],
    saving_throw_bonuses: { str: 3, dex: 0, con: 2, int: 0, wis: 3, cha: 5 },
    skill_bonuses: {
      acrobatics: 0, animal_handling: 1, arcana: 0, athletics: 5, deception: 3, history: 2,
      insight: 3, intimidation: 5, investigation: 0, medicine: 1, nature: 0, perception: 3,
      performance: 3, persuasion: 5, religion: 2, sleight_of_hand: 0, stealth: 0, survival: 1,
    },
    passive_perception: 13,
    passive_investigation: 10,
    passive_insight: 13,
    stealth_disadvantage: true,
    spellcasting_ability: 'cha',
    spell_save_dc: 13,
    spell_attack_bonus: 5,
    weapon_proficiencies: ['simple_weapons', 'martial_weapons'],
  };
}

const PREVIEW_STORE = {
  spellSlots: {
    standard_slots: [{ slot_level: 1, max: 2, available: 2 }],
    pact_magic_slots: [],
  },
  characters: [
    {
      id: 'preview-garrik',
      name: 'Garrik ojo de hierro',
      alignment: 'lawful_good',
      xp: 25,
      current_hp: 8,
      temp_hp: 8,
      base_str: 15,
      base_dex: 9,
      base_con: 13,
      base_int: 9,
      base_wis: 11,
      base_cha: 15,
      gp: 121203,
      sp: 1230,
      cp: 3212,
      is_dead: false,
      personality_traits: 'A pesar de mi origen noble no me considero por encima de los demás. Todos tenemos la misma sangre.',
      ideals: 'Deber de la nobleza. Es mi deber proteger y cuidar de aquellos bajo mi cargo.',
      bonds: 'Mi lealtad hacia el soberano es inquebrantable.',
      flaws: 'Percibo insultos velados y amenazas en todas las palabras que me dirigen. Además, me enfado rápidamente.',
      race: { race_id: 'human', name: 'Human', base_speed: 30 },
      background: { background_id: 'noble', name: 'Noble', tool_proficiencies: ['dragonchess_set'], languages: ['elvish'] },
      character_classes: [
        { class_id: 'paladin', class_level: 2, is_primary: true, class: { class_id: 'paladin', name: 'Paladin', hit_die: 10, spellcasting_ability: 'cha' } },
      ],
      character_skills: [
        { skill_id: 'athletics', is_proficient: true, is_expertise: false },
        { skill_id: 'history', is_proficient: true, is_expertise: false },
        { skill_id: 'insight', is_proficient: true, is_expertise: false },
        { skill_id: 'intimidation', is_proficient: true, is_expertise: false },
        { skill_id: 'persuasion', is_proficient: true, is_expertise: false },
        { skill_id: 'perception', is_proficient: true, is_expertise: false },
      ],
      character_tools: [{ tool_id: 'dragonchess_set', tool: { name: 'Juego de dragón ajedrez' } }],
      character_traits: [],
      inventory_items: [
        previewInventoryItem('longsword', 1, true),
        previewInventoryItem('shield', 1, true),
        previewInventoryItem('chain_mail', 1, true),
        previewInventoryItem('shortbow', 1, false),
        previewInventoryItem('arrows', 20, true),
        previewInventoryItem('healing_potion', 2, false),
        previewInventoryItem('backpack', 1, false),
        previewInventoryItem('rations', 5, false),
        previewInventoryItem('holy_symbol', 1, true),
        previewInventoryItem('terrible_helm', 1, false),
      ],
      hit_dice_trackers: [{ die_type: 10, max_dice: 2, expended_dice: 0 }],
      computed: previewComputed(),
    },
  ],
};

function previewClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function previewCharacter(id = 'preview-garrik') {
  return PREVIEW_STORE.characters.find(c => c.id === id) ?? PREVIEW_STORE.characters[0];
}

function previewCharacterResponse(id = 'preview-garrik') {
  const character = previewCharacter(id);
  character.computed = { ...previewComputed(), max_hp: character.computed?.max_hp ?? 20 };
  return previewClone(character);
}

function previewAddInventory(character, itemId, quantity = 1) {
  const item = previewFindItem(itemId);
  if (!item) throw new Error('Objeto de preview no encontrado');
  const existing = character.inventory_items.find(inv => inv.item_id === item.item_id);
  if (existing) existing.quantity += quantity;
  else character.inventory_items.push(previewInventoryItem(item.item_id, quantity, false));
}

async function request(method, path, body) {
  await delay(120);
  const [rawPath, rawQuery = ''] = String(path).split('?');
  const query = new URLSearchParams(rawQuery);

  if (rawPath === '/health') return { status: 'preview' };
  if (rawPath === '/auth/me') return { user: PREVIEW_PROFILE };
  if (rawPath === '/auth/logout') return { status: 'ok' };
  if (rawPath === '/catalog/items') return previewClone(PREVIEW_ITEMS);
  if (rawPath === '/catalog/races') return previewClone(PREVIEW_CATALOG.races);
  if (rawPath === '/catalog/classes') return previewClone(PREVIEW_CATALOG.classes);
  if (rawPath === '/catalog/backgrounds') return previewClone(PREVIEW_CATALOG.backgrounds);
  if (rawPath === '/catalog/languages') return previewClone(PREVIEW_LANGUAGES);
  if (rawPath === '/catalog/spells') {
    const level = query.get('level');
    const spells = PREVIEW_SPELLS.map(ks => ks.spell).filter(sp => level === null || Number(sp.level) === Number(level));
    return previewClone(spells);
  }

  if (rawPath === '/characters' && method === 'GET') return previewClone(PREVIEW_STORE.characters);
  if (rawPath === '/characters' && method === 'POST') {
    const newId = `preview-${Date.now()}`;
    const base = previewCharacterResponse();
    base.id = newId;
    base.name = body?.name || 'Nuevo personaje preview';
    base.xp = 0;
    base.current_hp = 10;
    base.temp_hp = 0;
    base.inventory_items = [];
    PREVIEW_STORE.characters.push(base);
    return previewClone(base);
  }

  const charMatch = rawPath.match(/^\/characters\/([^/]+)(?:\/(.+))?$/);
  if (!charMatch) throw new Error(`Preview sin endpoint: ${method} ${path}`);
  const [, id, tail = ''] = charMatch;
  const character = previewCharacter(id);
  if (!character) throw new Error('Personaje preview no encontrado');

  if (!tail && method === 'GET') return previewCharacterResponse(id);
  if (!tail && method === 'PATCH') {
    if (body?.name) character.name = body.name;
    if (body?.alignment) character.alignment = body.alignment;
    if (Number.isFinite(body?.current_hp)) character.current_hp = body.current_hp;
    if (Number.isFinite(body?.temp_hp)) character.temp_hp = body.temp_hp;
    if (body?.ability_scores) {
      Object.entries(body.ability_scores).forEach(([stat, value]) => {
        character[`base_${stat}`] = Number(value);
      });
    }
    return previewCharacterResponse(id);
  }
  if (!tail && method === 'DELETE') {
    PREVIEW_STORE.characters = PREVIEW_STORE.characters.filter(c => c.id !== id);
    return { message: 'Personaje preview eliminado' };
  }
  if (tail === 'hydrated' && method === 'GET') return previewCharacterResponse(id);
  if (tail === 'image' && method === 'PATCH') {
    character.image_data = body?.image_data || '';
    return { message: 'Imagen guardada en preview', image_data: character.image_data };
  }
  if (tail === 'skills' && method === 'GET') return previewClone(character.character_skills);
  if (tail.startsWith('skills/') && method === 'DELETE') {
    const skillId = decodeURIComponent(tail.split('/')[1]);
    character.character_skills = character.character_skills.filter(skill => skill.skill_id !== skillId);
    return { message: 'Habilidad eliminada en preview' };
  }
  if (tail === 'skills' && method === 'POST') {
    character.character_skills = character.character_skills.filter(skill => skill.skill_id !== body.skill_id);
    character.character_skills.push({ skill_id: body.skill_id, is_proficient: !!body.is_proficient, is_expertise: !!body.is_expertise });
    return { message: 'Habilidad agregada en preview' };
  }
  if (tail === 'languages' && method === 'GET') return previewClone(PREVIEW_LANGUAGES.slice(0, 2));
  if (tail === 'languages' && method === 'POST') return { message: 'Idioma agregado en preview' };
  if (tail === 'known-spells' && method === 'GET') return previewClone(PREVIEW_SPELLS);
  if (tail.startsWith('known-spells/') && method === 'DELETE') return { message: 'Conjuro olvidado en preview' };
  if (tail === 'known-spells' && method === 'POST') {
    const spell = PREVIEW_SPELLS.map(ks => ks.spell).find(sp => sp.spell_id === body.spell_id) || PREVIEW_SPELLS[0].spell;
    return { id: `preview-ks-${spell.spell_id}`, spell, is_prepared: !!body.is_prepared };
  }
  if (tail === 'spell-slots' && method === 'GET') return previewClone(PREVIEW_STORE.spellSlots);
  if (tail === 'cast' && method === 'POST') {
    const slot = PREVIEW_STORE.spellSlots.standard_slots.find(s => s.slot_level === body.slot_level);
    if (slot) slot.available = Math.max(0, slot.available - 1);
    const spell = PREVIEW_SPELLS.find(ks => ks.id === body.known_spell_id)?.spell ?? PREVIEW_SPELLS[0].spell;
    return { cast: spell.name, requires_concentration: !!spell.requires_concentration, previous_concentration_ended: false };
  }
  if (tail === 'concentration' && method === 'DELETE') return { message: 'Concentración terminada' };
  if (tail === 'damage' && method === 'POST') {
    let remaining = Math.max(0, Number(body?.damage) || 0);
    const tempSpent = Math.min(character.temp_hp || 0, remaining);
    character.temp_hp = Math.max(0, (character.temp_hp || 0) - tempSpent);
    remaining -= tempSpent;
    character.current_hp = Math.max(0, (character.current_hp || 0) - remaining);
    return { current_hp: character.current_hp, temp_hp: character.temp_hp, concentration_save_dc: remaining ? Math.max(10, Math.floor(remaining / 2)) : null };
  }
  if (tail === 'heal' && method === 'POST') {
    const maxHp = character.computed?.max_hp || 20;
    character.current_hp = Math.min(maxHp, (character.current_hp || 0) + (Number(body?.amount) || 0));
    return { current_hp: character.current_hp };
  }
  if (tail === 'temp-hp' && method === 'POST') {
    const amount = Math.max(0, Number(body?.amount) || 0);
    const replaced = amount >= (character.temp_hp || 0);
    if (replaced) character.temp_hp = amount;
    return { temp_hp: character.temp_hp, replaced };
  }
  if (tail === 'death-save' && method === 'POST') return { successes: 1, failures: 0, isDead: false, isStable: false, regainedHP: false };
  if (tail === 'exhaustion' && method === 'PATCH') return { exhaustion_level: Math.max(0, Number(body?.delta) || 0), character_died: false };
  if (tail === 'reaction' && method === 'PATCH') return { reaction_available: !!body?.reaction_available };
  if (tail === 'short-rest' && method === 'POST') return { hp_recovered: 7, new_current_hp: character.current_hp };
  if (tail === 'long-rest' && method === 'POST') {
    character.current_hp = character.computed?.max_hp || 20;
    PREVIEW_STORE.spellSlots.standard_slots.forEach(slot => { slot.available = slot.max; });
    return { message: 'Descanso largo aplicado en preview' };
  }
  if (tail === 'inventory' && method === 'POST') {
    previewAddInventory(character, body.item_id, Math.max(1, Number(body.quantity) || 1));
    return { message: 'Objeto agregado en preview' };
  }
  if (tail.startsWith('inventory/')) {
    const itemId = decodeURIComponent(tail.split('/')[1] || '');
    const action = tail.split('/')[2] || '';
    const inv = character.inventory_items.find(entry => entry.item_id === itemId);
    if (!inv) throw new Error('Objeto de inventario preview no encontrado');
    if (method === 'DELETE') {
      character.inventory_items = character.inventory_items.filter(entry => entry.item_id !== itemId);
      return { message: 'Objeto eliminado en preview' };
    }
    if (method === 'PATCH') {
      if (Number.isFinite(body?.quantity)) inv.quantity = body.quantity;
      if (typeof body?.is_equipped === 'boolean') inv.is_equipped = body.is_equipped;
      return previewClone(inv);
    }
    if (action === 'use' && method === 'POST') {
      const amount = Number(body?.effect_total) || 0;
      if (amount > 0) character.current_hp = Math.min(character.computed?.max_hp || 20, character.current_hp + amount);
      inv.quantity = Math.max(0, (inv.quantity || 1) - 1);
      if (inv.quantity <= 0) character.inventory_items = character.inventory_items.filter(entry => entry.item_id !== itemId);
      return { message: 'Objeto usado en preview', current_hp: character.current_hp, effect: amount ? { type: 'healing', amount } : null };
    }
  }

  throw new Error(`Preview sin endpoint: ${method} ${path}`);
}

export const previewApi = {
  profile: PREVIEW_PROFILE,
  request,
};

window.DND_PREVIEW_API = previewApi;
