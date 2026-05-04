// src/repositories/character.repository.ts
// DAL — all DB I/O lives here. No business logic.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Load a character with all relations needed for hydration */
export async function findCharacterById(id: string) {
  return prisma.character.findUnique({
    where: { id },
    include: {
      character_classes: { include: { class: true, subclass: true } },
      character_skills:  true,
      character_tools:   true,
      character_traits:  { include: { trait: true } },
      character_feats:   { include: { feat: true } },
      character_languages: { include: { language: true } },
      inventory_items:   { include: { item: true } },
      known_spells:      { include: { spell: true } },
      spell_slot_trackers: true,
      hit_dice_trackers:   true,
      resource_pools:      true,
      active_state:        true,
      race:                true,
      background:          true,
    },
  });
}

export async function createCharacter(data: Parameters<typeof prisma.character.create>[0]['data']) {
  return prisma.character.create({ data });
}

export async function updateCharacter(
  id: string,
  data: Parameters<typeof prisma.character.update>[0]['data'],
) {
  return prisma.character.update({ where: { id }, data });
}

export async function upsertActiveState(
  characterId: string,
  data: Omit<Parameters<typeof prisma.activeState.upsert>[0]['update'], 'character'>,
) {
  return prisma.activeState.upsert({
    where:  { character_id: characterId },
    create: { character_id: characterId, ...(data as object) },
    update: data,
  });
}

export { prisma };
