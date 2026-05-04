const API_CANDIDATES = [
  process.env.API_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

let API = API_CANDIDATES[0];
const DEMO_NAME = 'Demo Inventario Completo';

const itemNames = [
  ['Chain Mail', 1],
  ['Shield', 1],
  ['Longsword', 1],
  ['Longbow', 1],
  ['Arrows (20)', 2],
  ['Light Crossbow', 1],
  ['Crossbow Bolts (20)', 2],
  ["Explorer's Pack", 1],
  ['Potion of Healing', 3],
  ['Potion of Greater Healing', 1],
  ['Acid (vial)', 2],
  ["Alchemist's Fire", 2],
  ['Holy Water (flask)', 2],
  ['Antitoxin (vial)', 1],
  ['Oil (flask)', 3],
  ['Candle', 5],
  ["Healer's Kit", 1],
];

async function api(method, path, body) {
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    const cause = error?.cause?.message ? ` (${error.cause.message})` : '';
    throw new Error(`No se pudo conectar con ${API}${path}${cause}`);
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.error || data?.message || text || `${method} ${path} failed`);
  }
  return data;
}

async function resolveApiBase() {
  const errors = [];
  for (const candidate of API_CANDIDATES) {
    API = candidate;
    try {
      await api('GET', '/health');
      return candidate;
    } catch (error) {
      errors.push(error.message);
    }
  }
  throw new Error([
    'No pude conectar con la API en ninguno de estos destinos:',
    ...API_CANDIDATES.map(candidate => `- ${candidate}`),
    '',
    'Errores:',
    ...errors.map(error => `- ${error}`),
    '',
    'Verifica que `npm run dev` siga corriendo en otra terminal.',
    'Si la API sigue sin conectar, usa el creador directo:',
    'node scripts/create-demo-character.js',
  ].join('\n'));
}

function findByName(rows, name) {
  return rows.find(row => row.name?.toLowerCase() === name.toLowerCase());
}

async function main() {
  const apiBase = await resolveApiBase();
  console.log(`API detectada en ${apiBase}`);

  const [characters, races, backgrounds, classes, items] = await Promise.all([
    api('GET', '/characters'),
    api('GET', '/catalog/races'),
    api('GET', '/catalog/backgrounds'),
    api('GET', '/catalog/classes'),
    api('GET', '/catalog/items'),
  ]);

  const existing = characters.find(c => c.name === DEMO_NAME);
  if (existing) {
    await api('DELETE', `/characters/${existing.id}`);
  }

  const race = findByName(races, 'Human');
  const background = findByName(backgrounds, 'Soldier');
  const cls = findByName(classes, 'Fighter');
  if (!race || !background || !cls) throw new Error('Faltan catálogos base para crear el demo.');

  const character = await api('POST', '/characters', {
    name: DEMO_NAME,
    race_id: race.race_id,
    background_id: background.background_id,
    alignment: 'true_neutral',
    ability_scores: { str: 15, dex: 13, con: 14, int: 10, wis: 12, cha: 8 },
    class_id: cls.class_id,
    initial_level: 1,
    skill_selections: ['acrobatics', 'perception'],
    cantrip_selections: [],
    spell_selections: [],
    equipment_selections: [],
    hp_roll_base: 8,
    personality_traits: 'Personaje demo con inventario completo para verificar cards, kits, consumibles, dados y equipamiento.',
    ideals: 'Probar que todo se pinte correctamente.',
    bonds: 'Su mochila contiene todos los casos de prueba.',
    flaws: 'Carga demasiadas cosas.',
  });

  const itemByName = new Map(items.map(item => [item.name, item]));
  for (const [name, quantity] of itemNames) {
    const item = itemByName.get(name);
    if (!item) throw new Error(`No existe el item en catálogo: ${name}`);
    await api('POST', `/characters/${character.id}/inventory`, { item_id: item.item_id, quantity });
  }

  const refreshed = await api('GET', `/characters/${character.id}`);
  console.log(`Personaje demo creado: ${refreshed.name}`);
  console.log(`ID: ${refreshed.id}`);
  console.log(`Filas de inventario: ${refreshed.inventory_items?.length ?? 0}`);
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
