// src/api/controllers/catalog.controller.ts
// T-014 | Spec: plan.md §5 — Reference Data Catalog Endpoints

import { Router } from 'express';
import { prisma } from '../../repositories/character.repository';

export const catalogRouter = Router();

// ─── GET /catalog/races ───────────────────────────────────────────────────────
catalogRouter.get('/races', async (_req, res, next) => {
  try {
    const races = await prisma.race.findMany({
      include: {
        traits: { include: { trait: true } },
        subraces: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(races);
  } catch (err) { next(err); }
});

// ─── GET /catalog/races/:id ───────────────────────────────────────────────────
catalogRouter.get('/races/:id', async (req, res, next) => {
  try {
    const race = await prisma.race.findFirst({
      where: {
        OR: [
          { race_id: req.params['id'] },
          { name: { equals: req.params['id'], mode: 'insensitive' } },
        ],
      },
      include: {
        traits:    { include: { trait: true } },
        subraces:  true,
        parent_race: true,
      },
    });
    if (!race) { res.status(404).json({ error: 'Race not found.' }); return; }
    res.json(race);
  } catch (err) { next(err); }
});

// ─── GET /catalog/classes ─────────────────────────────────────────────────────
catalogRouter.get('/classes', async (_req, res, next) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        subclasses: true,
        features:   { orderBy: { level_acquired: 'asc' } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(classes);
  } catch (err) { next(err); }
});

// ─── GET /catalog/classes/:id ─────────────────────────────────────────────────
catalogRouter.get('/classes/:id', async (req, res, next) => {
  try {
    const cls = await prisma.class.findFirst({
      where: {
        OR: [
          { class_id: req.params['id'] },
          { name: { equals: req.params['id'], mode: 'insensitive' } },
        ],
      },
      include: {
        subclasses:              { orderBy: { unlock_level: 'asc' } },
        features:                { orderBy: { level_acquired: 'asc' } },
        spell_slot_progressions: { orderBy: [{ class_level: 'asc' }, { slot_level: 'asc' }] },
        class_spells:            { include: { spell: true } },
      },
    });
    if (!cls) { res.status(404).json({ error: 'Class not found.' }); return; }
    res.json(cls);
  } catch (err) { next(err); }
});

// ─── GET /catalog/backgrounds ─────────────────────────────────────────────────
catalogRouter.get('/backgrounds', async (_req, res, next) => {
  try {
    const bgs = await prisma.background.findMany({ orderBy: { name: 'asc' } });
    res.json(bgs);
  } catch (err) { next(err); }
});

// ─── GET /catalog/feats ───────────────────────────────────────────────────────
catalogRouter.get('/feats', async (_req, res, next) => {
  try {
    const feats = await prisma.feat.findMany({ orderBy: { name: 'asc' } });
    res.json(feats);
  } catch (err) { next(err); }
});

// ─── GET /catalog/spells ──────────────────────────────────────────────────────
// Query params: ?level=3  ?school=evocation  ?class=Wizard  ?concentration=true
catalogRouter.get('/spells', async (req, res, next) => {
  try {
    const { level, school, class: className, concentration } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    if (level !== undefined)        where['level']  = parseInt(level, 10);
    if (school)                     where['school'] = { equals: school, mode: 'insensitive' };
    if (concentration !== undefined) where['requires_concentration'] = concentration === 'true';

    let spells;
    if (className) {
      // Filter by class spell list
      spells = await prisma.spell.findMany({
        where: {
          ...where,
          class_spells: {
            some: {
              class: { name: { equals: className, mode: 'insensitive' } },
            },
          },
        },
        orderBy: [{ level: 'asc' }, { name: 'asc' }],
      });
    } else {
      spells = await prisma.spell.findMany({
        where,
        orderBy: [{ level: 'asc' }, { name: 'asc' }],
      });
    }
    res.json(spells);
  } catch (err) { next(err); }
});

// ─── GET /catalog/spells/:id ──────────────────────────────────────────────────
catalogRouter.get('/spells/:id', async (req, res, next) => {
  try {
    const spell = await prisma.spell.findFirst({
      where: {
        OR: [
          { spell_id: req.params['id'] },
          { name: { equals: req.params['id'], mode: 'insensitive' } },
        ],
      },
      include: {
        class_spells: { include: { class: { select: { name: true } } } },
      },
    });
    if (!spell) { res.status(404).json({ error: 'Spell not found.' }); return; }
    res.json(spell);
  } catch (err) { next(err); }
});

// ─── GET /catalog/items ───────────────────────────────────────────────────────
// Query params: ?type=weapon  ?type=armor  ?type=gear  ?type=tool
catalogRouter.get('/items', async (req, res, next) => {
  try {
    const { type } = req.query as Record<string, string>;
    const items = await prisma.item.findMany({
      where: type ? { item_type: { equals: type, mode: 'insensitive' } } : undefined,
      orderBy: [{ item_type: 'asc' }, { name: 'asc' }],
    });
    res.json(items);
  } catch (err) { next(err); }
});

// ─── GET /catalog/languages ───────────────────────────────────────────────────
catalogRouter.get('/languages', async (_req, res, next) => {
  try {
    const langs = await prisma.language.findMany({ orderBy: [{ language_type: 'asc' }, { name: 'asc' }] });
    res.json(langs);
  } catch (err) { next(err); }
});

// ─── GET /catalog/skills ──────────────────────────────────────────────────────
// Static list of the 18 D&D 5e skills with their governing ability
catalogRouter.get('/skills', (_req, res) => {
  res.json([
    { skill_id: 'acrobatics',      ability: 'dex', name: 'Acrobatics' },
    { skill_id: 'animal_handling', ability: 'wis', name: 'Animal Handling' },
    { skill_id: 'arcana',          ability: 'int', name: 'Arcana' },
    { skill_id: 'athletics',       ability: 'str', name: 'Athletics' },
    { skill_id: 'deception',       ability: 'cha', name: 'Deception' },
    { skill_id: 'history',         ability: 'int', name: 'History' },
    { skill_id: 'insight',         ability: 'wis', name: 'Insight' },
    { skill_id: 'intimidation',    ability: 'cha', name: 'Intimidation' },
    { skill_id: 'investigation',   ability: 'int', name: 'Investigation' },
    { skill_id: 'medicine',        ability: 'wis', name: 'Medicine' },
    { skill_id: 'nature',          ability: 'int', name: 'Nature' },
    { skill_id: 'perception',      ability: 'wis', name: 'Perception' },
    { skill_id: 'performance',     ability: 'cha', name: 'Performance' },
    { skill_id: 'persuasion',      ability: 'cha', name: 'Persuasion' },
    { skill_id: 'religion',        ability: 'int', name: 'Religion' },
    { skill_id: 'sleight_of_hand', ability: 'dex', name: 'Sleight of Hand' },
    { skill_id: 'stealth',         ability: 'dex', name: 'Stealth' },
    { skill_id: 'survival',        ability: 'wis', name: 'Survival' },
  ]);
});
