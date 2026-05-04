// prisma/seeds/feature.ts — T-012 | Spec: US-20 to US-47
// Class features per level for all 12 SRD 5.1 classes
import type { PrismaClient } from '@prisma/client';

type FeatureDef = {
  class_name: string;
  name: string;
  level_acquired: number;
  description: string;
  resource_cost?: object;
  reset_on?: 'short_rest' | 'long_rest';
};

export async function seedFeatures(prisma: PrismaClient) {
  console.log('  → Seeding class features...');

  const classes = await prisma.class.findMany();
  const classMap = new Map(classes.map(c => [c.name, c.class_id]));

  const features: FeatureDef[] = [
    // ── BARBARIAN ────────────────────────────────────────────────────────────
    { class_name: 'barbarian', name: 'Rage', level_acquired: 1,
      description: 'Enter a rage as a bonus action. Gain advantage on STR checks/saves, bonus damage, resistance to B/P/S damage. Lasts 1 minute.',
      resource_cost: { pool: 'rage', cost: 1 }, reset_on: 'long_rest' },
    { class_name: 'barbarian', name: 'Unarmored Defense (Barbarian)', level_acquired: 1,
      description: 'AC = 10 + DEX mod + CON mod when not wearing armor.' },
    { class_name: 'barbarian', name: 'Reckless Attack', level_acquired: 2,
      description: 'Attack with advantage using STR, but attacks against you have advantage until next turn.' },
    { class_name: 'barbarian', name: 'Danger Sense', level_acquired: 2,
      description: 'Advantage on DEX saving throws against visible effects.' },
    { class_name: 'barbarian', name: 'Extra Attack (Barbarian)', level_acquired: 5,
      description: 'Attack twice when using Attack action.' },
    { class_name: 'barbarian', name: 'Fast Movement', level_acquired: 5,
      description: '+10 speed when not wearing heavy armor.' },
    { class_name: 'barbarian', name: 'Feral Instinct', level_acquired: 7,
      description: 'Advantage on initiative. Can rage to act first if surprised.' },
    { class_name: 'barbarian', name: 'Brutal Critical', level_acquired: 9,
      description: 'Roll one additional weapon damage die on a critical hit.' },
    { class_name: 'barbarian', name: 'Relentless Rage', level_acquired: 11,
      description: 'When dropped to 0 HP while raging, make DC 10 CON save to stay at 1 HP.' },
    { class_name: 'barbarian', name: 'Persistent Rage', level_acquired: 15,
      description: 'Rage no longer ends early unless you choose to end it.' },
    { class_name: 'barbarian', name: 'Indomitable Might', level_acquired: 18,
      description: 'Minimum result on STR check equals your STR score.' },
    { class_name: 'barbarian', name: 'Primal Champion', level_acquired: 20,
      description: '+4 STR, +4 CON.' },

    // ── BARD ─────────────────────────────────────────────────────────────────
    { class_name: 'bard', name: 'Bardic Inspiration', level_acquired: 1,
      description: 'Give a creature a Bardic Inspiration die (d6). Can be used on ability check, attack, or saving throw.',
      resource_cost: { pool: 'bardic_inspiration', cost: 1 }, reset_on: 'long_rest' },
    { class_name: 'bard', name: 'Jack of All Trades', level_acquired: 2,
      description: 'Add half proficiency bonus (rounded down) to any ability check not already proficient.' },
    { class_name: 'bard', name: 'Song of Rest', level_acquired: 2,
      description: 'Allies regain extra HP at end of short rest.' },
    { class_name: 'bard', name: 'Expertise (Bard)', level_acquired: 3,
      description: 'Double proficiency bonus for two skill proficiencies.' },
    { class_name: 'bard', name: 'Font of Inspiration', level_acquired: 5,
      description: 'Regain all Bardic Inspiration on short or long rest.',
      reset_on: 'short_rest' },
    { class_name: 'bard', name: 'Countercharm', level_acquired: 6,
      description: 'Use action to allow allies to reroll saves vs charmed/frightened.' },
    { class_name: 'bard', name: 'Magical Secrets', level_acquired: 10,
      description: 'Learn 2 spells from any class spell list.' },

    // ── CLERIC ───────────────────────────────────────────────────────────────
    { class_name: 'cleric', name: 'Divine Domain Feature', level_acquired: 1,
      description: 'Gain features from chosen divine domain.' },
    { class_name: 'cleric', name: 'Channel Divinity', level_acquired: 2,
      description: 'Use a channel divinity option (Turn Undead or domain option).',
      resource_cost: { pool: 'channel_divinity', cost: 1 }, reset_on: 'short_rest' },
    { class_name: 'cleric', name: 'Turn Undead', level_acquired: 2,
      description: 'Channel Divinity: turn undead creatures.' },
    { class_name: 'cleric', name: 'Destroy Undead', level_acquired: 5,
      description: 'On successful Turn Undead, destroy undead of CR 1/2 or lower (scales).' },
    { class_name: 'cleric', name: 'Divine Intervention', level_acquired: 10,
      description: 'Call on your deity for aid. Requires d100 ≤ cleric level to succeed.' },

    // ── DRUID ────────────────────────────────────────────────────────────────
    { class_name: 'druid', name: 'Druidic', level_acquired: 1,
      description: 'Know the Druidic secret language and can leave hidden messages.' },
    { class_name: 'druid', name: 'Wild Shape', level_acquired: 2,
      description: 'Magically assume the shape of a beast. CR restriction scales with level.',
      resource_cost: { pool: 'wild_shape', cost: 1 }, reset_on: 'short_rest' },
    { class_name: 'druid', name: 'Timeless Body (Druid)', level_acquired: 18,
      description: 'Druid does not age and cannot be aged magically.' },
    { class_name: 'druid', name: 'Beast Spells', level_acquired: 18,
      description: 'Can cast spells while in Wild Shape form.' },

    // ── FIGHTER ──────────────────────────────────────────────────────────────
    { class_name: 'fighter', name: 'Fighting Style', level_acquired: 1,
      description: 'Choose a fighting style specialization.' },
    { class_name: 'fighter', name: 'Second Wind', level_acquired: 1,
      description: 'Bonus action: regain 1d10 + fighter level HP.',
      resource_cost: { pool: 'second_wind', cost: 1 }, reset_on: 'short_rest' },
    { class_name: 'fighter', name: 'Action Surge', level_acquired: 2,
      description: 'Take one additional action on your turn.',
      resource_cost: { pool: 'action_surge', cost: 1 }, reset_on: 'short_rest' },
    { class_name: 'fighter', name: 'Extra Attack (Fighter)', level_acquired: 5,
      description: 'Attack twice when using Attack action.' },
    { class_name: 'fighter', name: 'Indomitable', level_acquired: 9,
      description: 'Reroll a failed saving throw.',
      resource_cost: { pool: 'indomitable', cost: 1 }, reset_on: 'long_rest' },

    // ── MONK ─────────────────────────────────────────────────────────────────
    { class_name: 'monk', name: 'Unarmored Defense (Monk)', level_acquired: 1,
      description: 'AC = 10 + DEX mod + WIS mod when unarmored and without shield.' },
    { class_name: 'monk', name: 'Martial Arts', level_acquired: 1,
      description: 'Use DEX instead of STR for unarmed strikes/monk weapons. Bonus unarmed strike.' },
    { class_name: 'monk', name: 'Ki', level_acquired: 2,
      description: 'Spend ki points to fuel special abilities. Points equal monk level.',
      resource_cost: { pool: 'ki', cost: 1 }, reset_on: 'short_rest' },
    { class_name: 'monk', name: 'Flurry of Blows', level_acquired: 2,
      description: 'After Attack action, spend 1 ki to make 2 unarmed strikes as bonus action.' },
    { class_name: 'monk', name: 'Patient Defense', level_acquired: 2,
      description: 'Spend 1 ki to take Dodge action as bonus action.' },
    { class_name: 'monk', name: 'Step of the Wind', level_acquired: 2,
      description: 'Spend 1 ki to Dash or Disengage as bonus action.' },
    { class_name: 'monk', name: 'Unarmored Movement', level_acquired: 2,
      description: 'Speed increases when unarmored. Starts at +10, scales to +30.' },
    { class_name: 'monk', name: 'Deflect Missiles', level_acquired: 3,
      description: 'Use reaction to deflect or catch ranged weapon attacks.' },
    { class_name: 'monk', name: 'Slow Fall', level_acquired: 4,
      description: 'Reduce fall damage by 5 × monk level.' },
    { class_name: 'monk', name: 'Extra Attack (Monk)', level_acquired: 5,
      description: 'Attack twice when using Attack action.' },
    { class_name: 'monk', name: 'Stunning Strike', level_acquired: 5,
      description: 'Spend 1 ki when hitting to force CON save or target is stunned until your next turn.' },
    { class_name: 'monk', name: 'Ki-Empowered Strikes', level_acquired: 6,
      description: 'Unarmed strikes count as magical.' },
    { class_name: 'monk', name: 'Evasion (Monk)', level_acquired: 7,
      description: 'Succeed DEX save for no damage; fail for half.' },
    { class_name: 'monk', name: 'Stillness of Mind', level_acquired: 7,
      description: 'Use action to end charmed or frightened condition on yourself.' },
    { class_name: 'monk', name: 'Purity of Body', level_acquired: 10,
      description: 'Immune to disease and poison.' },
    { class_name: 'monk', name: 'Tongue of the Sun and Moon', level_acquired: 13,
      description: 'Understand all spoken languages.' },
    { class_name: 'monk', name: 'Diamond Soul', level_acquired: 14,
      description: 'Proficient in all saving throws. Spend 1 ki to reroll a failed save.' },
    { class_name: 'monk', name: 'Timeless Body (Monk)', level_acquired: 15,
      description: 'Need no food or water. Immune to magical aging.' },
    { class_name: 'monk', name: 'Empty Body', level_acquired: 18,
      description: 'Spend 4 ki to become invisible. Spend 8 ki to cast astral projection.' },
    { class_name: 'monk', name: 'Perfect Self', level_acquired: 20,
      description: 'If you have no ki points at start of turn, regain 4 ki.' },

    // ── PALADIN ──────────────────────────────────────────────────────────────
    { class_name: 'paladin', name: 'Divine Sense', level_acquired: 1,
      description: 'Detect celestials, fiends, and undead within 60 ft.',
      resource_cost: { pool: 'divine_sense', cost: 1 }, reset_on: 'long_rest' },
    { class_name: 'paladin', name: 'Lay on Hands', level_acquired: 1,
      description: 'Pool of HP = 5 × paladin level. Use to heal or cure disease/poison.',
      resource_cost: { pool: 'lay_on_hands', cost: 1 }, reset_on: 'long_rest' },
    { class_name: 'paladin', name: 'Fighting Style (Paladin)', level_acquired: 2,
      description: 'Choose a fighting style.' },
    { class_name: 'paladin', name: 'Spellcasting (Paladin)', level_acquired: 2,
      description: 'Cast paladin spells using CHA.' },
    { class_name: 'paladin', name: 'Divine Smite', level_acquired: 2,
      description: 'Expend spell slot on hit to deal extra radiant damage (2d8 per slot level + 1d8).' },
    { class_name: 'paladin', name: 'Divine Health', level_acquired: 3,
      description: 'Immune to disease.' },
    { class_name: 'paladin', name: 'Extra Attack (Paladin)', level_acquired: 5,
      description: 'Attack twice when using Attack action.' },
    { class_name: 'paladin', name: 'Aura of Protection', level_acquired: 6,
      description: 'Allies within 10 ft add CHA modifier to saving throws.' },
    { class_name: 'paladin', name: 'Aura of Courage', level_acquired: 10,
      description: 'Allies within 10 ft cannot be frightened.' },
    { class_name: 'paladin', name: 'Improved Divine Smite', level_acquired: 11,
      description: 'All melee weapon attacks deal extra 1d8 radiant damage.' },
    { class_name: 'paladin', name: 'Cleansing Touch', level_acquired: 14,
      description: 'Use action to end one spell on creature. Uses = CHA mod per long rest.' },

    // ── RANGER ───────────────────────────────────────────────────────────────
    { class_name: 'ranger', name: 'Favored Enemy', level_acquired: 1,
      description: 'Advantage on WIS (Survival) to track favored enemies, advantage on INT to recall info.' },
    { class_name: 'ranger', name: 'Natural Explorer', level_acquired: 1,
      description: 'Expertise with INT/WIS checks in favored terrain. Ignore difficult terrain in travel.' },
    { class_name: 'ranger', name: 'Fighting Style (Ranger)', level_acquired: 2,
      description: 'Choose a fighting style.' },
    { class_name: 'ranger', name: 'Spellcasting (Ranger)', level_acquired: 2,
      description: 'Cast ranger spells using WIS.' },
    { class_name: 'ranger', name: 'Primeval Awareness', level_acquired: 3,
      description: 'Spend spell slot to sense natural/unnatural beasts within 1 mile.' },
    { class_name: 'ranger', name: 'Extra Attack (Ranger)', level_acquired: 5,
      description: 'Attack twice when using Attack action.' },
    { class_name: 'ranger', name: "Land's Stride", level_acquired: 8,
      description: 'Move through nonmagical difficult terrain without penalty. Advantage vs magical plants.' },
    { class_name: 'ranger', name: 'Hide in Plain Sight', level_acquired: 10,
      description: 'Spend 1 minute to camouflage. +10 to Stealth while motionless.' },
    { class_name: 'ranger', name: 'Vanish', level_acquired: 14,
      description: 'Hide as bonus action. Untrackable by nonmagical means.' },
    { class_name: 'ranger', name: 'Feral Senses', level_acquired: 18,
      description: 'No disadvantage attacking invisible creatures. Detect invisible creatures within 30 ft.' },
    { class_name: 'ranger', name: 'Foe Slayer', level_acquired: 20,
      description: 'Once per turn, add WIS modifier to attack or damage roll vs favored enemy.' },

    // ── ROGUE ────────────────────────────────────────────────────────────────
    { class_name: 'rogue', name: 'Expertise (Rogue)', level_acquired: 1,
      description: 'Double proficiency for two skills/thieves tools.' },
    { class_name: 'rogue', name: 'Sneak Attack', level_acquired: 1,
      description: 'Extra damage when attacking with advantage or when ally is adjacent. 1d6 per 2 rogue levels.' },
    { class_name: 'rogue', name: "Thieves' Cant", level_acquired: 1,
      description: 'Secret language of thieves. Pass hidden messages in plain conversation.' },
    { class_name: 'rogue', name: 'Cunning Action', level_acquired: 2,
      description: 'Dash, Disengage, or Hide as bonus action.' },
    { class_name: 'rogue', name: 'Uncanny Dodge', level_acquired: 5,
      description: 'Use reaction to halve damage from an attack you can see.' },
    { class_name: 'rogue', name: 'Evasion (Rogue)', level_acquired: 7,
      description: 'Succeed DEX save for no damage; fail for half.' },
    { class_name: 'rogue', name: 'Reliable Talent', level_acquired: 11,
      description: 'Minimum roll of 10 on proficient skill checks.' },
    { class_name: 'rogue', name: 'Blindsense', level_acquired: 14,
      description: 'Detect hidden creatures within 10 ft.' },
    { class_name: 'rogue', name: 'Slippery Mind', level_acquired: 15,
      description: 'Proficiency in WIS saving throws.' },
    { class_name: 'rogue', name: 'Elusive', level_acquired: 18,
      description: "Attacks against you can't benefit from advantage." },
    { class_name: 'rogue', name: 'Stroke of Luck', level_acquired: 20,
      description: 'Turn a miss into a hit or a failed ability check into 20.' },

    // ── SORCERER ─────────────────────────────────────────────────────────────
    { class_name: 'sorcerer', name: 'Spellcasting (Sorcerer)', level_acquired: 1,
      description: 'Cast sorcerer spells using CHA.' },
    { class_name: 'sorcerer', name: 'Sorcerous Origin', level_acquired: 1,
      description: 'Choose origin subclass granting features at levels 1, 6, 14, 18.' },
    { class_name: 'sorcerer', name: 'Font of Magic', level_acquired: 2,
      description: 'Gain sorcery points (= sorcerer level). Use for Flexible Casting or metamagic.',
      resource_cost: { pool: 'sorcery_points', cost: 1 }, reset_on: 'long_rest' },
    { class_name: 'sorcerer', name: 'Metamagic', level_acquired: 3,
      description: 'Choose 2 metamagic options. Use sorcery points to modify spells.' },
    { class_name: 'sorcerer', name: 'Sorcerous Restoration', level_acquired: 20,
      description: 'Regain 4 sorcery points at the start of each short rest.' },

    // ── WARLOCK ──────────────────────────────────────────────────────────────
    { class_name: 'warlock', name: 'Otherworldly Patron', level_acquired: 1,
      description: 'Choose patron that grants expanded spell list and features.' },
    { class_name: 'warlock', name: 'Pact Magic', level_acquired: 1,
      description: 'Cast spells using pact magic slots. Recover on short rest.',
      reset_on: 'short_rest' },
    { class_name: 'warlock', name: 'Eldritch Invocations', level_acquired: 2,
      description: 'Learn 2 eldritch invocations. Additional invocations at higher levels.' },
    { class_name: 'warlock', name: 'Pact Boon', level_acquired: 3,
      description: 'Choose Pact of the Chain, Pact of the Blade, or Pact of the Tome.' },
    { class_name: 'warlock', name: 'Mystic Arcanum', level_acquired: 11,
      description: 'Cast one 6th-level spell once per long rest without a spell slot.' },
    { class_name: 'warlock', name: 'Eldritch Master', level_acquired: 20,
      description: 'Spend 1 minute entreating patron to regain all pact magic slots.' },

    // ── WIZARD ───────────────────────────────────────────────────────────────
    { class_name: 'wizard', name: 'Spellcasting (Wizard)', level_acquired: 1,
      description: 'Cast wizard spells using INT. Spellbook holds prepared spells.' },
    { class_name: 'wizard', name: 'Arcane Recovery', level_acquired: 1,
      description: 'Once per day, recover spell slots totaling up to half wizard level (rounded up) on short rest.',
      resource_cost: { pool: 'arcane_recovery', cost: 1 }, reset_on: 'long_rest' },
    { class_name: 'wizard', name: 'Arcane Tradition', level_acquired: 2,
      description: 'Choose school subclass granting features at levels 2, 6, 10, 14.' },
    { class_name: 'wizard', name: 'Spell Mastery', level_acquired: 18,
      description: 'Choose a 1st and 2nd level spell to cast at will without slots.' },
    { class_name: 'wizard', name: 'Signature Spells', level_acquired: 20,
      description: 'Choose two 3rd-level spells as signature spells, castable without slot once per short rest.' },
  ];

  let count = 0;
  for (const f of features) {
    const class_id = classMap.get(f.class_name);
    if (!class_id) { console.warn(`    ⚠ Class not found: ${f.class_name}`); continue; }
    await prisma.feature.upsert({
      where: { class_id_name: { class_id, name: f.name } },
      update: {
        level_acquired: f.level_acquired,
        description: f.description,
        ...(f.resource_cost !== undefined && { resource_cost: f.resource_cost }),
        reset_on: f.reset_on ?? undefined,
      },
      create: {
        class_id,
        name: f.name,
        level_acquired: f.level_acquired,
        description: f.description,
        resource_cost: f.resource_cost ?? undefined,
        reset_on: f.reset_on ?? undefined,
      },
    });
    count++;
  }
  console.log(`    ✓ ${count} class features seeded.`);
}
