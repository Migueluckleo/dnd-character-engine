// tests/integration/character-lifecycle.integration.test.ts — T-060, T-061, T-062, T-063
// Integration tests for full character lifecycle using pure service functions.
// No DB required — validates the service layer end-to-end with realistic inputs.

import { validatePointBuy, applyRacialBonuses } from '../../src/services/ability-score.service';
import { calculateMaxHP } from '../../src/services/health.service';
import { processDeathSave, applyDamage, setTempHP } from '../../src/services/combat-state.service';
import { getModifier, getProficiencyBonus } from '../../src/services/math.service';
import { calculatePassiveChecks } from '../../src/services/passive-check.service';
import { buildSlotTrackerRows, recoverSlotsOnRest, type ClassEntry } from '../../src/services/spell-slot.service';

const NO_EXPENDED = new Map<string, number>();

// ── T-060: Full character creation validation ─────────────────────────────────
describe('T-060 | Full character creation — Point Buy + racial bonuses + HP', () => {
  // Standard Fighter: STR 15, DEX 13, CON 14, INT 8, WIS 12, CHA 10
  // Point cost: 9 + 5 + 7 + 0 + 4 + 2 = 27 ✓
  const baseScores = { str: 15, dex: 13, con: 14, int: 8, wis: 12, cha: 10 };

  it('validates legal 27-point buy', () => {
    const result = validatePointBuy(baseScores);
    expect(result.valid).toBe(true);
    expect(result.pointsUsed).toBe(27);
  });

  it('rejects point buy exceeding 27 points', () => {
    // STR 15 (9) + DEX 15 (9) + CON 14 (7) + INT 10 (2) + WIS 12 (4) + CHA 10 (2) = 33
    const illegal = { str: 15, dex: 15, con: 14, int: 10, wis: 12, cha: 10 };
    expect(validatePointBuy(illegal).valid).toBe(false);
  });

  it('rejects score below 8', () => {
    expect(validatePointBuy({ ...baseScores, int: 7 }).valid).toBe(false);
  });

  it('rejects score above 15', () => {
    expect(validatePointBuy({ ...baseScores, str: 16 }).valid).toBe(false);
  });

  it('applies human racial bonuses (+1 to all)', () => {
    const bonuses = { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 };
    const final = applyRacialBonuses(baseScores, bonuses);
    expect(final).toMatchObject({ str: 16, dex: 14, con: 15, int: 9, wis: 13, cha: 11 });
  });

  it('applies Mountain Dwarf racial bonus (+2 STR, +2 CON)', () => {
    const bonuses = { str: 2, dex: 0, con: 2, int: 0, wis: 0, cha: 0 };
    const final = applyRacialBonuses(baseScores, bonuses);
    expect(final.str).toBe(17);
    expect(final.con).toBe(16);
    expect(final.dex).toBe(13); // unchanged
  });

  it('clamps racial bonuses at 20 maximum', () => {
    const bonuses = { str: 10, dex: 0, con: 0, int: 0, wis: 0, cha: 0 }; // 15+10=25 → 20
    expect(applyRacialBonuses(baseScores, bonuses).str).toBe(20);
  });

  it('CON modifier for score 14 = +2', () => {
    expect(getModifier(14)).toBe(2);
  });

  it('Fighter level 1 max HP = 10 (hit die) + 2 (CON mod) = 12', () => {
    const hp = calculateMaxHP(
      [{ hitDie: 10, classLevel: 1, isPrimary: true }],
      14, // CON 14 → mod +2
    );
    expect(hp).toBe(12);
  });

  it('Fighter level 5 max HP uses average rolls for levels 2-5', () => {
    // Level 1: 10 + 2 = 12; Levels 2-5: (floor(10/2)+1) + 2 = 8 each → 4*8 = 32
    // Total: 12 + 32 = 44
    const hp = calculateMaxHP(
      [{ hitDie: 10, classLevel: 5, isPrimary: true }],
      14,
    );
    expect(hp).toBe(44);
  });

  it('proficiency bonus: level 1 = 2, level 5 = 3, level 9 = 4, level 17 = 6', () => {
    expect(getProficiencyBonus(1)).toBe(2);
    expect(getProficiencyBonus(5)).toBe(3);
    expect(getProficiencyBonus(9)).toBe(4);
    expect(getProficiencyBonus(17)).toBe(6);
  });
});

// ── T-061: Death save flow ────────────────────────────────────────────────────
describe('T-061 | Death saving throw flow', () => {
  it('natural 20 stabilizes and restores 1 HP (resets counters)', () => {
    const result = processDeathSave(0, 2, 20);
    expect(result.regainedHP).toBe(1);
    expect(result.isStable).toBe(false); // nat-20 is not "stable", it's regained HP
    expect(result.isDead).toBe(false);
    expect(result.successes).toBe(0); // reset
    expect(result.failures).toBe(0); // reset
  });

  it('natural 1 adds 2 failures', () => {
    const result = processDeathSave(0, 0, 1);
    expect(result.failures).toBe(2);
    expect(result.isDead).toBe(false);
  });

  it('3 failures = dead (nat-1 on 1 existing failure → 3 total)', () => {
    const result = processDeathSave(0, 1, 1); // 1 failure + nat-1 adds 2 = 3
    expect(result.isDead).toBe(true);
  });

  it('3 successes = stable', () => {
    const result = processDeathSave(2, 1, 15); // 2 + 1 = 3 successes
    expect(result.isStable).toBe(true);
    expect(result.regainedHP).toBeNull();
    expect(result.isDead).toBe(false);
  });

  it('roll 9 is a failure (DC 10)', () => {
    const result = processDeathSave(1, 0, 9);
    expect(result.failures).toBe(1);
    expect(result.successes).toBe(1); // unchanged
  });

  it('roll 10 is a success (DC 10)', () => {
    const result = processDeathSave(0, 0, 10);
    expect(result.successes).toBe(1);
    expect(result.failures).toBe(0);
  });

  it('failures capped at 3 — marks dead, does not go higher', () => {
    const result = processDeathSave(0, 2, 1); // nat-1 adds 2 → would be 4, capped at 3
    expect(result.failures).toBe(3);
    expect(result.isDead).toBe(true);
  });
});

// ── T-062: Damage + temp HP + concentration ───────────────────────────────────
describe('T-062 | Damage application with temp HP and concentration', () => {
  it('temp HP fully absorbs small damage', () => {
    const result = applyDamage({ currentHp: 20, tempHp: 5, maxHp: 20, damage: 3, isConcentrating: false });
    expect(result.tempHp).toBe(2);
    expect(result.currentHp).toBe(20); // real HP untouched
  });

  it('temp HP partially absorbed, remainder hits real HP', () => {
    const result = applyDamage({ currentHp: 20, tempHp: 3, maxHp: 20, damage: 8, isConcentrating: false });
    expect(result.tempHp).toBe(0);
    expect(result.currentHp).toBe(15); // 20 - (8-3) = 15
  });

  it('HP drops to 0 when damage exceeds current+temp HP', () => {
    const result = applyDamage({ currentHp: 5, tempHp: 2, maxHp: 20, damage: 20, isConcentrating: false });
    expect(result.currentHp).toBe(0);
    expect(result.deathSaveTriggered).toBe(true);
  });

  it('instant death when excess damage >= maxHp (massive damage rule US-72)', () => {
    // currentHp=5, maxHp=20: instant death if damage >= 5+20 = 25
    const result = applyDamage({ currentHp: 5, tempHp: 0, maxHp: 20, damage: 25, isConcentrating: false });
    expect(result.isDead).toBe(true);
  });

  it('no instant death when damage < currentHp + maxHp', () => {
    const result = applyDamage({ currentHp: 5, tempHp: 0, maxHp: 20, damage: 24, isConcentrating: false });
    expect(result.isDead).toBe(false);
  });

  it('concentration DC = max(10, floor(damage/2)) for large damage', () => {
    const result = applyDamage({ currentHp: 30, tempHp: 0, maxHp: 30, damage: 30, isConcentrating: true });
    expect(result.concentrationSaveDC).toBe(15); // floor(30/2) = 15
  });

  it('concentration DC minimum is 10 for small damage', () => {
    const result = applyDamage({ currentHp: 20, tempHp: 0, maxHp: 20, damage: 4, isConcentrating: true });
    expect(result.concentrationSaveDC).toBe(10); // floor(4/2)=2 → max(10,2)=10
  });

  it('concentrationSaveDC is null when not concentrating', () => {
    const result = applyDamage({ currentHp: 20, tempHp: 0, maxHp: 20, damage: 10, isConcentrating: false });
    expect(result.concentrationSaveDC).toBeNull();
  });

  it('setTempHP keeps higher value (no stacking rule US-73.2)', () => {
    expect(setTempHP(5, 10)).toBe(10);  // new is higher → accept
    expect(setTempHP(10, 5)).toBe(10);  // current is higher → keep
    expect(setTempHP(0, 8)).toBe(8);    // from 0 → accept any
  });
});

// ── T-063: Long Rest full recovery ───────────────────────────────────────────
describe('T-063 | Long Rest — full spell slot recovery', () => {
  const wizardClasses: ClassEntry[] = [
    { classId: 'wizard', classLevel: 5, casterType: 'full' },
  ];

  it('long rest recovers all standard slots fully', () => {
    // All slots expended
    const expended = new Map([
      ['combined-1', 4], ['combined-2', 3], ['combined-3', 2],
    ]);
    const rows = buildSlotTrackerRows(wizardClasses, expended);
    const recovered = recoverSlotsOnRest(rows, 'long_rest');
    recovered.forEach(r => {
      expect(r.expendedSlots).toBe(0);
    });
  });

  it('long rest with already-full slots is idempotent', () => {
    const rows = buildSlotTrackerRows(wizardClasses, NO_EXPENDED);
    const recovered = recoverSlotsOnRest(rows, 'long_rest');
    recovered.forEach(r => {
      expect(r.expendedSlots).toBe(0);
    });
  });

  it('short rest does NOT recover standard slots', () => {
    const expended = new Map([['combined-1', 4]]);
    const rows = buildSlotTrackerRows(wizardClasses, expended);
    const afterShortRest = recoverSlotsOnRest(rows, 'short_rest');
    expect(afterShortRest.find(r => r.slotLevel === 1)!.expendedSlots).toBe(4); // unchanged
  });

  it('passive perception with proficiency: 10 + WIS mod + prof bonus', () => {
    // WIS 14 → mod +2, profBonus = 2 (level 1)
    // Expected: 10 + 2 + 2 = 14
    const result = calculatePassiveChecks({
      scores: { str: 10, dex: 10, con: 10, int: 10, wis: 14, cha: 10 },
      totalLevel: 1,
      isPerceptionProficient: true,
      isInvestigationProficient: false,
      isInsightProficient: false,
      isPerceptionExpertise: false,
      isInvestigationExpertise: false,
      isInsightExpertise: false,
      hasJackOfAllTrades: false,
    });
    expect(result.passivePerception).toBe(14);
  });

  it('passive perception without proficiency: 10 + WIS mod only', () => {
    const result = calculatePassiveChecks({
      scores: { str: 10, dex: 10, con: 10, int: 10, wis: 14, cha: 10 },
      totalLevel: 1,
      isPerceptionProficient: false,
      isInvestigationProficient: false,
      isInsightProficient: false,
      isPerceptionExpertise: false,
      isInvestigationExpertise: false,
      isInsightExpertise: false,
      hasJackOfAllTrades: false,
    });
    expect(result.passivePerception).toBe(12); // 10 + 2
  });

  it('Bard Jack of All Trades adds half proficiency to passive checks', () => {
    // WIS 14, level 2 bard, not proficient in perception, Jack of All Trades
    // halfProf = floor(2/4) + 1... wait, profBonus(2) = 2, halfProf = floor(2/2) = 1
    // passive perception = 10 + 2 (WIS mod) + 1 (half prof) = 13
    const result = calculatePassiveChecks({
      scores: { str: 10, dex: 10, con: 10, int: 10, wis: 14, cha: 10 },
      totalLevel: 2,
      isPerceptionProficient: false,
      isInvestigationProficient: false,
      isInsightProficient: false,
      isPerceptionExpertise: false,
      isInvestigationExpertise: false,
      isInsightExpertise: false,
      hasJackOfAllTrades: true,
    });
    expect(result.passivePerception).toBe(13); // 10 + 2 + 1
  });
});
