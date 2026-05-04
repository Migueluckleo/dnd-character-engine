// prisma/seeds/feat.ts — T-015 | Spec: US-83
import { PrismaClient, Prisma } from '@prisma/client';

export async function seedFeats(prisma: PrismaClient) {
  const feats: Array<{
    feat_id: string;
    name: string;
    description: string;
    prerequisite?: Prisma.InputJsonValue;
    effects: Prisma.InputJsonValue;
    repeatable: boolean;
  }> = [
    { feat_id: 'alert',              name: 'Alert',               description: '+5 initiative, cannot be surprised while conscious, hidden creatures gain no advantage on attacks.',  effects: { initiative_bonus: 5, cannot_be_surprised: true }, repeatable: false },
    { feat_id: 'lucky',              name: 'Lucky',               description: '3 luck points per long rest. Spend to roll an extra d20 on attack, ability check, or save.',         effects: { luck_points: 3 }, repeatable: false },
    { feat_id: 'mobile',             name: 'Mobile',              description: '+10 ft speed, Dash ignores difficult terrain, no opportunity attacks from creatures you attack.',      effects: { speed_bonus: 10 }, repeatable: false },
    { feat_id: 'resilient',          name: 'Resilient',           description: '+1 to chosen ability score, gain proficiency in that ability\'s saving throw.',                       effects: { ability_score_bonus: 1, new_save_proficiency: true }, repeatable: false },
    { feat_id: 'tavern_brawler',     name: 'Tavern Brawler',      description: '+1 STR or CON, proficiency with improvised weapons, unarmed strikes deal 1d4.',                       effects: { ability_score_bonus: 1, unarmed_die: 4 }, repeatable: false },
    { feat_id: 'tough',              name: 'Tough',               description: 'HP maximum increases by 2 × your level. Each level gained adds 2 more HP.',                          effects: { hp_bonus_per_level: 2 }, repeatable: false },
    { feat_id: 'war_caster',         name: 'War Caster',          description: 'Advantage on CON saves to maintain concentration, can cast spells as opportunity attacks.',           prerequisite: { requires_spellcasting: true }, effects: { concentration_advantage: true, opportunity_spell: true }, repeatable: false },
    { feat_id: 'great_weapon_master',name: 'Great Weapon Master', description: 'Bonus attack on critical or killing blow. Can take -5 attack for +10 damage.',                       effects: { bonus_attack_on_crit: true, power_attack: { attack_penalty: -5, damage_bonus: 10 } }, repeatable: false },
    { feat_id: 'sharpshooter',       name: 'Sharpshooter',        description: 'No disadvantage at long range, ignore cover bonuses, can take -5 attack for +10 damage.',            effects: { ignore_long_range_disadvantage: true, power_attack: { attack_penalty: -5, damage_bonus: 10 } }, repeatable: false },
    { feat_id: 'polearm_master',     name: 'Polearm Master',      description: 'Bonus attack with polearm butt end (1d4), opportunity attacks on entry.',                            effects: { bonus_butt_attack: true }, repeatable: false },
  ];

  for (const feat of feats) {
    await prisma.feat.upsert({
      where:  { feat_id: feat.feat_id },
      create: {
        feat_id:     feat.feat_id,
        name:        feat.name,
        description: feat.description,
        effects:     feat.effects,
        repeatable:  feat.repeatable,
        ...(feat.prerequisite !== undefined && { prerequisite: feat.prerequisite }),
      },
      update: {},
    });
  }
  console.log(`  ✓ Feats: ${feats.length} seeded`);
}
