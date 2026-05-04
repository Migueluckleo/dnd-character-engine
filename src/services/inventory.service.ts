// src/services/inventory.service.ts
// T-031 | Spec: FR-07, US-62–US-69

export interface InventoryItem {
  itemId: string;
  weight: number;
  quantity: number;
  isEquipped: boolean;
  isAttuned: boolean;
}

export interface EncumbranceResult {
  carriedWeight: number;
  carryingCapacity: number;
  pushDragLiftLimit: number;
  isEncumbered: boolean;
  speedPenalty: number; // feet reduced from base speed
}

/**
 * FR-07: Calculate encumbrance from inventory + coins.
 */
export function calculateEncumbrance(
  items: InventoryItem[],
  strScore: number,
  totalCoins: number,
): EncumbranceResult {
  const itemWeight = items.reduce((sum, i) => sum + i.weight * i.quantity, 0);
  const coinWeight = totalCoins / 50;
  const carriedWeight = itemWeight + coinWeight;
  const carryingCapacity = strScore * 15;
  const pushDragLiftLimit = strScore * 30;

  const isEncumbered = carriedWeight > carryingCapacity;
  const speedPenalty = carriedWeight > pushDragLiftLimit ? 25 : 0;

  return { carriedWeight, carryingCapacity, pushDragLiftLimit, isEncumbered, speedPenalty };
}

/**
 * AC 67.3: Apply speed penalty if equipped armor has STR requirement not met.
 */
export function getArmorSpeedPenalty(
  strScore: number,
  armorStrengthRequirement: number | null,
): number {
  if (armorStrengthRequirement && strScore < armorStrengthRequirement) {
    return 10;
  }
  return 0;
}

/** US-62.2: Validate attunement — max 3 items simultaneously. */
export function validateAttunement(currentAttunedCount: number): boolean {
  return currentAttunedCount < 3;
}

const MAX_ATTUNED = 3;
export { MAX_ATTUNED };
