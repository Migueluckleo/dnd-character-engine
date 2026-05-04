// src/api/controllers/inventory.controller.ts
// T-051 | Spec: US-62–US-69

import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/error-handler';
import { deadCharacterGuard, attunementGuard } from '../middleware/guards';
import { findCharacterById, prisma } from '../../repositories/character.repository';

export const inventoryRouter = Router();

type InventoryItemWithItem = NonNullable<Awaited<ReturnType<typeof findCharacterById>>>['inventory_items'][number];

function itemProps(item: { properties: unknown }): Record<string, unknown> {
  return (item.properties ?? {}) as Record<string, unknown>;
}

function normalizeAmmunitionQuantity(item: { name: string; item_type: string }, quantity: number): number {
  const match = item.item_type === 'ammunition' ? item.name.match(/\((\d+)\)$/) : null;
  const bundleSize = match ? Number(match[1]) : 0;
  return bundleSize ? Math.max(quantity, bundleSize) : quantity;
}

function calculateMaxHp(character: NonNullable<Awaited<ReturnType<typeof findCharacterById>>>): number {
  const racialBonuses = (character.race?.ability_bonuses as Record<string, number>) ?? {};
  const con = character.base_con + (racialBonuses['con'] ?? 0);
  const conMod = Math.floor((con - 10) / 2);
  let maxHp = 0;
  for (const cc of character.character_classes) {
    const hitDie = cc.class?.hit_die ?? 8;
    const avg = Math.floor(hitDie / 2) + 1;
    if (cc.is_primary) {
      maxHp += ((character as any).level_1_hp_roll ?? hitDie) + conMod;
      maxHp += Math.max(0, cc.class_level - 1) * (avg + conMod);
    } else {
      maxHp += cc.class_level * (avg + conMod);
    }
  }
  return Math.max(1, maxHp);
}

async function decrementInventoryItem(characterId: string, itemId: string, quantity = 1): Promise<void> {
  const inv = await prisma.inventoryItem.findUnique({
    where: { character_id_item_id: { character_id: characterId, item_id: itemId } },
  });
  if (!inv || inv.quantity < quantity) {
    throw new AppError(422, 'Not enough item quantity.', 'No hay suficientes unidades de este objeto.');
  }
  if (inv.quantity === quantity) {
    await prisma.inventoryItem.delete({
      where: { character_id_item_id: { character_id: characterId, item_id: itemId } },
    });
  } else {
    await prisma.inventoryItem.update({
      where: { character_id_item_id: { character_id: characterId, item_id: itemId } },
      data: { quantity: { decrement: quantity } },
    });
  }
}

async function unpackPackIntoInventory(
  characterId: string,
  item: { pack_contents: unknown; name: string },
  multiplier = 1,
): Promise<string[]> {
  const contents = item.pack_contents as Array<{ item?: string; item_id?: string; qty?: number; quantity?: number }>;
  const added: string[] = [];
  for (const entry of contents) {
    const child = await prisma.item.findFirst({
      where: entry.item_id
        ? { item_id: entry.item_id }
        : { name: { equals: entry.item ?? '', mode: 'insensitive' } },
    });
    if (!child) continue;
    const entryQty = normalizeAmmunitionQuantity(child, entry.quantity ?? entry.qty ?? 1) * multiplier;
    await prisma.inventoryItem.upsert({
      where: { character_id_item_id: { character_id: characterId, item_id: child.item_id } },
      create: { character_id: characterId, item_id: child.item_id, quantity: entryQty },
      update: { quantity: { increment: entryQty } },
    });
    added.push(child.item_id);
  }
  return added;
}

function isBodyArmor(inv: InventoryItemWithItem): boolean {
  return inv.item.item_type === 'armor' && inv.item.armor_category !== 'shield';
}

function isShield(inv: InventoryItemWithItem): boolean {
  return inv.item.item_type === 'armor' && inv.item.armor_category === 'shield';
}

function isWeapon(inv: InventoryItemWithItem): boolean {
  return inv.item.item_type === 'weapon';
}

function isAmmunition(inv: InventoryItemWithItem): boolean {
  return inv.item.item_type === 'ammunition';
}

function isTwoHandedWeapon(inv: InventoryItemWithItem): boolean {
  return isWeapon(inv) && itemProps(inv.item)['two_handed'] === true;
}

function isRangedAmmunitionWeapon(inv: InventoryItemWithItem): boolean {
  return isWeapon(inv) && itemProps(inv.item)['ammunition'] === true;
}

function isOneHandWeapon(inv: InventoryItemWithItem): boolean {
  return isWeapon(inv) && !isTwoHandedWeapon(inv);
}

function ammoTypeForWeapon(inv: InventoryItemWithItem): string | null {
  const name = inv.item.name.toLowerCase();
  if (name.includes('crossbow')) return 'crossbow';
  if (name.includes('bow')) return 'bow';
  if (name.includes('sling')) return 'sling';
  if (name.includes('blowgun')) return 'blowgun';
  return null;
}

function ammoTypeForAmmunition(inv: InventoryItemWithItem): string | null {
  const raw = itemProps(inv.item)['weapon_type'];
  return typeof raw === 'string' && raw.length > 0 ? raw : null;
}

function dualWeaponClassAllowed(character: NonNullable<Awaited<ReturnType<typeof findCharacterById>>>): boolean {
  const allowed = new Set(['barbarian', 'bard', 'fighter', 'monk', 'paladin', 'ranger', 'rogue']);
  return character.character_classes.some(cc => allowed.has(cc.class.name.toLowerCase()));
}

function canPairOneHandWeapons(
  character: NonNullable<Awaited<ReturnType<typeof findCharacterById>>>,
  a: InventoryItemWithItem,
  b: InventoryItemWithItem,
): boolean {
  if (!isOneHandWeapon(a) || !isOneHandWeapon(b)) return false;
  if (itemProps(a.item)['light'] === true && itemProps(b.item)['light'] === true) return true;
  return dualWeaponClassAllowed(character);
}

async function autoEquipAmmunition(characterId: string, weapon: InventoryItemWithItem): Promise<void> {
  const ammoType = ammoTypeForWeapon(weapon);
  if (!ammoType) return;
  await prisma.inventoryItem.updateMany({
    where: {
      character_id: characterId,
      is_equipped: true,
      item: { item_type: 'ammunition' },
    },
    data: { is_equipped: false },
  });
  const ammo = await prisma.inventoryItem.findFirst({
    where: {
      character_id: characterId,
      quantity: { gt: 0 },
      item: {
        item_type: 'ammunition',
        properties: { path: ['weapon_type'], equals: ammoType },
      },
    },
    include: { item: true },
    orderBy: { item: { name: 'asc' } },
  });
  if (ammo) {
    await prisma.inventoryItem.update({
      where: { character_id_item_id: { character_id: characterId, item_id: ammo.item_id } },
      data: { is_equipped: true },
    });
  }
}

// ─── POST /characters/:id/inventory ──────────────────────────────────────────
inventoryRouter.post('/:id/inventory', async (req, res, next) => {
  try {
    const { item_id, quantity } = z.object({
      item_id:  z.string(),
      quantity: z.number().int().positive().default(1),
    }).parse(req.body);

    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    deadCharacterGuard(character.is_dead);

    // Fetch item
    const item = await prisma.item.findUnique({ where: { item_id } });
    if (!item) throw new AppError(404, `Item '${item_id}' not found.`, `El objeto '${item_id}' no existe en el catálogo.`);

    // AC 69.1: Equipment pack unpacking
    if (item.item_type === 'pack' && item.pack_contents) {
      const added = await unpackPackIntoInventory(req.params['id']!, item, quantity);

      return res.status(201).json({
        message: `Paquete '${item.name}' desglosado en ${added.length} objetos.`,
        items_added: added,
      });
    }

    // Regular item upsert
    const normalizedQuantity = normalizeAmmunitionQuantity(item, quantity);
    await prisma.inventoryItem.upsert({
      where: { character_id_item_id: { character_id: req.params['id']!, item_id } },
      create: { character_id: req.params['id']!, item_id, quantity: normalizedQuantity },
      update: { quantity: { increment: normalizedQuantity } },
    });

    res.status(201).json({ message: `'${item.name}' añadido al inventario.`, item_id, quantity: normalizedQuantity });
  } catch (err) { next(err); }
});

// ─── PATCH /characters/:id/inventory/:item_id ────────────────────────────────
inventoryRouter.patch('/:id/inventory/:item_id', async (req, res, next) => {
  try {
    const { is_equipped, is_attuned, quantity } = z.object({
      is_equipped: z.boolean().optional(),
      is_attuned:  z.boolean().optional(),
      quantity:    z.number().int().positive().optional(),
    }).parse(req.body);

    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    deadCharacterGuard(character.is_dead);

    // AC 62.2: Attunement guard — max 3
    if (is_attuned === true) {
      const currentAttuned = character.inventory_items.filter(i => i.is_attuned).length;
      attunementGuard(currentAttuned);
    }

    const target = character.inventory_items.find(i => i.item_id === req.params['item_id']);
    if (!target) throw new AppError(404, 'Inventory item not found.', 'Objeto de inventario no encontrado.');

    if (is_equipped === true) {
      if (!isWeapon(target) && !isBodyArmor(target) && !isShield(target) && !isAmmunition(target)) {
        throw new AppError(422, 'Item is not equippable.', 'Este objeto no se puede equipar.');
      }

      if (isBodyArmor(target)) {
        await prisma.inventoryItem.updateMany({
          where: {
            character_id: req.params['id']!,
            is_equipped: true,
            item: { item_type: 'armor', NOT: { armor_category: 'shield' } },
          },
          data: { is_equipped: false },
        });
      }

      if (isTwoHandedWeapon(target) || isRangedAmmunitionWeapon(target)) {
        await prisma.inventoryItem.updateMany({
          where: {
            character_id: req.params['id']!,
            is_equipped: true,
            item: {
              OR: [
                { item_type: 'weapon' },
                { item_type: 'armor', armor_category: 'shield' },
              ],
            },
            NOT: { item_id: target.item_id },
          },
          data: { is_equipped: false },
        });
      } else if (isOneHandWeapon(target)) {
        const equippedShield = character.inventory_items.find(i => i.is_equipped && isShield(i));
        const equippedWeapons = character.inventory_items.filter(i => i.is_equipped && isWeapon(i) && i.item_id !== target.item_id);
        if (equippedShield) {
          await prisma.inventoryItem.updateMany({
            where: {
              character_id: req.params['id']!,
              is_equipped: true,
              item: { item_type: 'weapon' },
              NOT: { item_id: target.item_id },
            },
            data: { is_equipped: false },
          });
        } else {
          const keepable = equippedWeapons.find(w => canPairOneHandWeapons(character, target, w));
          await prisma.inventoryItem.updateMany({
            where: {
              character_id: req.params['id']!,
              is_equipped: true,
              item: { item_type: 'weapon' },
              NOT: { item_id: { in: [target.item_id, keepable?.item_id].filter(Boolean) as string[] } },
            },
            data: { is_equipped: false },
          });
        }
      }

      if (isShield(target)) {
        const equippedWeapons = character.inventory_items.filter(i => i.is_equipped && isWeapon(i));
        const oneHandToKeep = equippedWeapons.find(isOneHandWeapon);
        await prisma.inventoryItem.updateMany({
          where: {
            character_id: req.params['id']!,
            is_equipped: true,
            item: { item_type: 'weapon' },
            ...(oneHandToKeep ? { NOT: { item_id: oneHandToKeep.item_id } } : {}),
          },
          data: { is_equipped: false },
        });
        await prisma.inventoryItem.updateMany({
          where: {
            character_id: req.params['id']!,
            is_equipped: true,
            item: { item_type: 'armor', armor_category: 'shield' },
            NOT: { item_id: target.item_id },
          },
          data: { is_equipped: false },
        });
      }

      if (isAmmunition(target)) {
        const ammoType = ammoTypeForAmmunition(target);
        const equippedRangedWeapon = character.inventory_items.find(i => i.is_equipped && isRangedAmmunitionWeapon(i));
        const requiredAmmoType = equippedRangedWeapon ? ammoTypeForWeapon(equippedRangedWeapon) : null;

        if (requiredAmmoType && ammoType !== requiredAmmoType) {
          throw new AppError(
            422,
            `Ammunition type '${ammoType ?? 'unknown'}' is incompatible with equipped weapon '${equippedRangedWeapon?.item.name}'.`,
            'Esta munición no es compatible con el arma a distancia equipada.',
          );
        }

        await prisma.inventoryItem.updateMany({
          where: {
            character_id: req.params['id']!,
            is_equipped: true,
            item: { item_type: 'ammunition' },
            NOT: { item_id: target.item_id },
          },
          data: { is_equipped: false },
        });
      }
    }

    const updated = await prisma.inventoryItem.update({
      where: { character_id_item_id: { character_id: req.params['id']!, item_id: req.params['item_id']! } },
      data: {
        ...(is_equipped !== undefined ? { is_equipped } : {}),
        ...(is_attuned  !== undefined ? { is_attuned }  : {}),
        ...(quantity    !== undefined ? { quantity }     : {}),
      },
      include: { item: true },
    });

    if (is_equipped === true && (isRangedAmmunitionWeapon(target) || isTwoHandedWeapon(target))) {
      await autoEquipAmmunition(req.params['id']!, target);
    }

    res.json(updated);
  } catch (err) { next(err); }
});

// ─── POST /characters/:id/inventory/:item_id/use ─────────────────────────────
inventoryRouter.post('/:id/inventory/:item_id/use', async (req, res, next) => {
  try {
    const { effect_total } = z.object({
      effect_total: z.coerce.number().int().nonnegative().optional(),
    }).parse(req.body);

    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    deadCharacterGuard(character.is_dead);

    const inv = character.inventory_items.find(i => i.item_id === req.params['item_id']);
    if (!inv || inv.quantity < 1) {
      throw new AppError(404, 'Inventory item not found.', 'Objeto de inventario no encontrado.');
    }

    const props = itemProps(inv.item);

    if (inv.item.item_type === 'pack' && inv.item.pack_contents) {
      const added = await unpackPackIntoInventory(req.params['id']!, inv.item, 1);
      await decrementInventoryItem(req.params['id']!, inv.item_id, 1);
      return res.json({
        action: 'unpacked',
        message: `${inv.item.name} abierto y agregado como artículos individuales.`,
        items_added: added,
      });
    }

    const isPotion = inv.item.item_type === 'potion';
    const hasUseEffect = isPotion
      || props['heal_dice']
      || props['damage_dice']
      || props['effect']
      || ['Rations (1 day)', 'Torch', 'Candle', 'Oil (flask)', 'Holy Water (flask)', 'Acid (vial)', 'Alchemist\'s Fire', 'Antitoxin (vial)', 'Basic Poison (vial)'].includes(inv.item.name);

    if (!hasUseEffect) {
      throw new AppError(422, 'Item is not usable.', 'Este objeto no tiene una acción de uso configurada.');
    }

    let currentHp = character.current_hp;
    let appliedEffect: Record<string, unknown> = {};

    if (props['heal_dice']) {
      if (effect_total === undefined) {
        throw new AppError(
          422,
          'Healing consumables with dice require effect_total.',
          'Lanza los dados antes de aplicar este consumible.',
        );
      }
      const healAmount = effect_total;
      const maxHp = calculateMaxHp(character);
      currentHp = Math.min(maxHp, character.current_hp + healAmount);
      const resetSaves = currentHp > 0 && character.current_hp === 0;
      await prisma.character.update({
        where: { id: req.params['id']! },
        data: {
          current_hp: currentHp,
          ...(resetSaves ? { death_saves_success: 0, death_saves_fail: 0 } : {}),
        },
      });
      if (resetSaves) {
        await prisma.activeState.upsert({
          where: { character_id: req.params['id']! },
          create: { character_id: req.params['id']!, is_unconscious: false },
          update: { is_unconscious: false },
        });
      }
      appliedEffect = { type: 'healing', amount: healAmount, current_hp: currentHp, max_hp: maxHp };
    } else if (props['damage_dice']) {
      appliedEffect = {
        type: 'damage_roll',
        amount: effect_total ?? 0,
        damage_type: props['damage_type'] ?? inv.item.damage_type ?? null,
      };
    } else {
      appliedEffect = {
        type: 'consumed',
        description: props['description'] ?? props['effect'] ?? `${inv.item.name} usado.`,
      };
    }

    await decrementInventoryItem(req.params['id']!, inv.item_id, 1);

    res.json({
      action: 'used',
      item_id: inv.item_id,
      item_name: inv.item.name,
      current_hp: currentHp,
      effect: appliedEffect,
      message: `${inv.item.name} usado.`,
    });
  } catch (err) { next(err); }
});

// ─── DELETE /characters/:id/inventory/:item_id ───────────────────────────────
inventoryRouter.delete('/:id/inventory/:item_id', async (req, res, next) => {
  try {
    const character = await findCharacterById(req.params['id']!);
    if (!character) throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');

    await prisma.inventoryItem.delete({
      where: { character_id_item_id: { character_id: req.params['id']!, item_id: req.params['item_id']! } },
    });

    res.json({ message: 'Objeto eliminado del inventario.' });
  } catch (err) { next(err); }
});
