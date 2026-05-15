export interface ParsedDiceFormula {
  count: number;
  sides: number;
  bonus: number;
}

export interface DiceRollResult {
  rolls: number[];
  bonus: number;
  total: number;
}

export function escapeText(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, ch => (
    {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch] ?? ch
  ));
}

export function fmt(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function sidesToDieClass(sides: unknown): string {
  const value = Number(sides);
  if (value === 4) return 'd4';
  if (value === 6) return 'd6';
  if (value === 8) return 'd8';
  if (value === 10) return 'd10';
  if (value === 12) return 'd12';
  if (value === 100) return 'd100';
  return 'd20';
}

export function parseDiceFormula(formula: unknown): ParsedDiceFormula | null {
  const match = String(formula || '').match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) return null;
  return {
    count: Number(match[1]),
    sides: Number(match[2]),
    bonus: Number(match[3] || 0),
  };
}

function rollWithDiceRoller(formula: string): DiceRollResult | null {
  if (typeof window === 'undefined') return null;
  const DiceRoller = window.rpgDiceRoller?.DiceRoller;
  if (!DiceRoller) return null;

  try {
    const result = new DiceRoller().roll(formula);
    const dieGroup = result.rolls?.[0];
    const rolls = dieGroup?.rolls
      ? dieGroup.rolls.map((roll: { value?: number; initialValue?: number } | number) => (
        typeof roll === 'number' ? roll : roll.value ?? roll.initialValue ?? 0
      ))
      : [];
    const diceSum = rolls.reduce((sum: number, value: number) => sum + value, 0);
    return {
      rolls,
      bonus: result.total - diceSum,
      total: result.total,
    };
  } catch {
    return null;
  }
}

export function rollDiceFormula(formula: unknown): DiceRollResult {
  const source = String(formula || '').trim();
  const libraryResult = rollWithDiceRoller(source);
  if (libraryResult) return libraryResult;

  const parsed = parseDiceFormula(source);
  if (!parsed) return { rolls: [], bonus: 0, total: 0 };

  const rolls = Array.from(
    { length: parsed.count },
    () => Math.floor(Math.random() * parsed.sides) + 1,
  );

  return {
    rolls,
    bonus: parsed.bonus,
    total: rolls.reduce((sum, value) => sum + value, 0) + parsed.bonus,
  };
}

export const legacyUtils = {
  escapeText,
  fmt,
  delay,
  sidesToDieClass,
  parseDiceFormula,
  rollDiceFormula,
};

declare global {
  interface Window {
    DND_UTILS?: typeof legacyUtils;
    rpgDiceRoller?: {
      DiceRoller: new () => {
        roll: (formula: string) => {
          total: number;
          rolls?: Array<{
            rolls?: Array<{ value?: number; initialValue?: number } | number>;
          }>;
        };
      };
    };
  }
}

if (typeof window !== 'undefined') {
  window.DND_UTILS = legacyUtils;
}
