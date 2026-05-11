# Phase 3: Tasks - `tasks.md`

> **SDD Rule:** No code is written until the task is listed here with status `[ ]` and its parent spec (US or FR) is explicitly referenced.
> **Legend:** `[ ]` = Pending · `[~]` = In Progress · `[x]` = Done · `[!]` = Blocked

---

## Phase 2.1 — Database Provisioning

### T-001: Initialize Node.js/TypeScript project scaffold
- **Spec:** plan.md §1 (Tech Stack)
- **Action:** Run `npm init -y`; install `typescript`, `ts-node`, `@types/node`; generate `tsconfig.json` with `strict: true`, `target: ES2022`, `moduleResolution: node16`.
- **Done when:** `tsc --noEmit` exits 0 with no errors on an empty `src/index.ts`.
- **Status:** `[x]`

### T-002: Install and configure Prisma ORM
- **Spec:** plan.md §1 (ORM)
- **Action:** `npm install prisma @prisma/client`; run `npx prisma init`; configure `DATABASE_URL` in `.env` pointing to a local PostgreSQL instance.
- **Done when:** `npx prisma db push` succeeds on an empty schema.
- **Status:** `[x]`

### T-003: Define Static Catalog tables in schema.prisma
- **Spec:** plan.md §2.1
- **Action:** Define Prisma models for: `Race`, `Class`, `Subclass`, `Background`, `Trait`, `Item`, `Spell`, `Feature`, `Language`, `Feat`, `SpellSlotProgression`. Include all columns, types, and relations as specified. Add enums: `Size`, `ArmorCategory`, `CasterType`, `SlotSource`, `RestRecovery`, `LanguageType`.
- **Done when:** `npx prisma migrate dev --name init_catalogs` runs without errors and tables are visible in DB.
- **Status:** `[x]`

### T-004: Define Transactional Data tables in schema.prisma
- **Spec:** plan.md §2.2
- **Action:** Define Prisma models for: `Character`, `CharacterClass`, `CharacterSkill`, `CharacterTool`, `CharacterTrait`, `CharacterFeat`, `CharacterLanguage`, `InventoryItem`, `KnownSpell`, `SpellSlotTracker`, `HitDiceTracker`, `ResourcePool`, `ActiveState`. Add all FK relations and `@@unique` constraints.
- **Done when:** `npx prisma migrate dev --name init_transactional` runs without errors; all FK constraints resolve correctly.
- **Status:** `[x]`

### T-005: Validate schema column nomenclature
- **Spec:** `.claude.md` §4 (snake_case), plan.md §2
- **Action:** Script-check that all table names and column names in `schema.prisma` use `snake_case`. Verify `Character` includes `is_dead`, `active_concentration_spell_id`, `milestone_leveling`, `level_up_available`, `temp_hp`. Verify `ActiveState` includes all 14 condition booleans + `exhaustion_level` + `reaction_available`. Verify `Spell` includes `requires_concentration`.
- **Done when:** Automated lint script exits 0 with no snake_case violations.
- **Status:** `[x]`

---

## Phase 2.2 — Master Seeding

### T-006: Seed Language catalog
- **Spec:** US-84 (AC 84.1, 84.2)
- **Action:** Create `prisma/seeds/language.ts`. Insert 8 standard languages (`common`, `dwarvish`, `elvish`, `giant`, `gnomish`, `goblin`, `halfling`, `orc`) and 8 exotic languages (`abyssal`, `celestial`, `draconic`, `deep_speech`, `infernal`, `primordial`, `sylvan`, `undercommon`).
- **Done when:** `SELECT COUNT(*) FROM language` returns 16.
- **Status:** `[x]`

### T-007: Seed Race catalog (9 races + subraces)
- **Spec:** US-07 through US-19 (all race ACs)
- **Action:** Create `prisma/seeds/race.ts`. Seed all 9 base races and their subraces. **Critical:** Gnome must have `size = small` (AC 17.2). Each race must include `base_speed`, `ability_bonuses` JSONB, `darkvision_radius`, and FK to associated `Trait` records.
- **Done when:** All 9 races present; `SELECT size FROM race WHERE race_id = 'gnome'` returns `small`.
- **Status:** `[x]`

### T-008: Seed Class catalog (12 classes)
- **Spec:** US-20 through US-47 (all 12 classes, base traits & progression)
- **Action:** Create `prisma/seeds/class.ts`. Seed all 12 classes with `hit_die`, saving throw proficiency arrays, `caster_type` (full/half/warlock/none), and `multiclass_proficiencies` JSONB. Verify Barbarian = d12, Sorcerer = d6, Fighter `caster_type = none` (unless EK), etc.
- **Done when:** `SELECT COUNT(*) FROM class` returns 12; each row has non-null `hit_die` and `caster_type`.
- **Status:** `[x]`

### T-009: Seed Subclass catalog
- **Spec:** plan.md §2.1 (Subclass table)
- **Action:** Create `prisma/seeds/subclass.ts`. Seed at minimum the subclasses referenced in US-20–US-39 (Berserker, Champion, Thief, Draconic Bloodline, etc.) with correct `unlock_level`.
- **Done when:** Each class has at least one seeded subclass.
- **Status:** `[x]`

### T-010: Seed Background catalog (13 backgrounds)
- **Spec:** US-48 through US-61 (Core Background Integration + all 13 individual backgrounds)
- **Action:** Create `prisma/seeds/background.ts`. Seed 13 backgrounds with `starting_gold`, skill proficiency arrays, tool proficiency arrays, and language grants JSONB. Verify Sage grants 2 language choices (AC 84.4).
- **Done when:** `SELECT COUNT(*) FROM background` returns 13.
- **Status:** `[x]`

### T-011: Seed Trait catalog (racial + class features)
- **Spec:** US-07–US-39 (racial/class traits referenced in ACs)
- **Action:** Create `prisma/seeds/trait.ts`. Seed all racial and class traits referenced in requirements.md with structured `effects` JSONB. Include: *Darkvision*, *Dwarven Resilience*, *Fey Ancestry*, *Gnome Cunning*, *Halfling Lucky*, *Relentless Endurance*, *Savage Attacks*, *Draconic Resilience*, *Martial Arts*, *Unarmored Defense* (Barbarian + Monk variants), *Rage*, *Action Surge*, *Divine Sense*, *Lay on Hands*, *Sneak Attack*, *Bardic Inspiration*, *Wild Shape*, *Hunter's Mark*, *Hex*, *Arcane Recovery*, etc.
- **Done when:** All traits referenced in requirements.md US-07–US-39 are present with non-null `effects` JSONB.
- **Status:** `[x]`

### T-012: Seed Feature catalog (class features per level)
- **Spec:** US-20–US-47 (class features at levels 1–5)
- **Action:** Create `prisma/seeds/feature.ts`. Seed class features with `level_acquired`, `resource_cost`, and `reset_on` (short_rest / long_rest). Examples: Action Surge resets on `short_rest`; Rage resets on `long_rest`; Lay on Hands pool resets on `long_rest`.
- **Done when:** Every class has features seeded for levels 1 through 5; `reset_on` is populated for all resource-consuming features.
- **Status:** `[x]`

### T-013: Seed Spell catalog with concentration flag
- **Spec:** US-78 (AC 78.6), US-31 (Wizard spells), US-37 (Cleric), US-41 (Druid), etc.
- **Action:** Create `prisma/seeds/spell.ts`. Seed SRD spells for levels 0–3 (cantrips through 3rd level) with `level`, `school`, `casting_time`, `duration`, `requires_concentration` (boolean), and `spellcasting_ability`. **Critical:** Concentration spells like *Hex*, *Hunter's Mark*, *Bless*, *Faerie Fire*, *Entangle* must have `requires_concentration = true`.
- **Done when:** `SELECT COUNT(*) FROM spell WHERE requires_concentration = true` > 0; spot-check Hex and Hunter's Mark both return `true`.
- **Status:** `[x]`

### T-014: Seed Item catalog (weapons, armor, gear)
- **Spec:** US-62–US-69 (equipment system)
- **Action:** Create `prisma/seeds/item.ts`. Seed: (a) all armor types with `armor_category`, `ac_base`, `strength_requirement`, `stealth_disadvantage`; (b) all SRD weapons with `damage_dice`, `damage_type`, and `properties` JSONB (finesse, heavy, light, thrown, versatile, two_handed, range_normal, range_long, ammunition); (c) equipment packs with constituent items list in `properties` JSONB for unpacking logic.
- **Done when:** `SELECT COUNT(*) FROM item WHERE armor_category IS NOT NULL` > 0; longsword has `versatile` property; rapier has `finesse` property; Explorer's Pack has `properties.pack_contents` array.
- **Status:** `[x]`

### T-015: Seed Feat catalog
- **Spec:** US-83 (AC 83.1–83.4)
- **Action:** Create `prisma/seeds/feat.ts`. Seed standard 5e feats with `prerequisites` JSONB (ability score minimums, race, proficiency requirements), `effects` JSONB (ability bonuses, new proficiencies, new actions), and `repeatable` boolean. Include at minimum: *Alert*, *Lucky*, *Mobile*, *Resilient*, *Tavern Brawler*, *Tough*, *War Caster*.
- **Done when:** Alert feat present with `effects.initiative_bonus = 5`; Tough feat present with `effects.hp_bonus_per_level = 2`; War Caster present with `prerequisites.spellcasting = true`.
- **Status:** `[x]`

### T-016: Seed SpellSlotProgression tables
- **Spec:** US-79 (AC 79.1–79.3)
- **Action:** Create `prisma/seeds/spell_slot_progression.ts`. Seed full caster table (Bard, Cleric, Druid, Sorcerer, Wizard) for levels 1–20; half caster table (Paladin, Ranger) starting at level 2; Warlock Pact Magic table with `slot_source = pact_magic` and `rest_recovery = short_rest`.
- **Done when:** `SELECT * FROM spell_slot_progression WHERE class_id = 'wizard' AND class_level = 5` returns slots: 1st=4, 2nd=3, 3rd=2; `SELECT * FROM spell_slot_progression WHERE class_id = 'warlock' AND class_level = 3` returns 1 slot of 2nd level with `rest_recovery = short_rest`.
- **Status:** `[x]`

### T-017: Create master seed runner
- **Spec:** plan.md §6 (Phase 2.2)
- **Action:** Create `prisma/seed.ts` that calls all seed files in dependency order (Language → Race → Class → Subclass → Background → Trait → Feature → Spell → Item → Feat → SpellSlotProgression). Wire to `prisma.seed` in `package.json`.
- **Done when:** `npx prisma db seed` runs all seeders in order and exits 0 on a clean DB; re-running it is idempotent (upsert logic).
- **Status:** `[x]`

---

## Phase 2.3 — Logic Services (Test-Driven)

> **TDD Rule (from `.claude.md` §2):** For every service task below, write the unit tests FIRST, then implement. Tests must reference the AC from `requirements.md`. Services must never mutate input data.

### T-018: Implement MathService
- **Spec:** FR-01, FR-05, `.claude.md` §3 (floor rule)
- **Tests:** `modifier(10) === 0`, `modifier(8) === -1`, `modifier(20) === 5`, `modifier(1) === -5`; `proficiencyBonus(1) === 2`, `proficiencyBonus(5) === 3`, `proficiencyBonus(9) === 4`.
- **Action:** Implement `src/services/math.service.ts` with `getModifier(score: number): number` and `getProficiencyBonus(totalLevel: number): number`. All divisions must use `Math.floor`.
- **Done when:** All unit tests pass.
- **Status:** `[x]`

### T-019: Implement AbilityScoreService — Point Buy validation
- **Spec:** US-01, US-85 (AC 85.1–85.5), FR-06
- **Tests:** Cost of score 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9; budget of 27 accepted; budget of 28 rejected; score 7 rejected; score 16 before racial bonus rejected; total points spent correctly.
- **Action:** Implement `src/services/ability-score.service.ts` with `validatePointBuy(scores: AbilityScoreInput): ValidationResult` and `applyRacialBonuses(scores, raceBonuses): AbilityScores`.
- **Done when:** All AC 85.1–85.5 tests pass.
- **Status:** `[x]`

### T-020: Implement HealthService — Max HP calculation
- **Spec:** FR-03, FR-04, US-22 (Barbarian), US-28 (Monk), US-82.2 (multiclass HP)
- **Tests:** Level 1 Fighter (d10, CON +2) → max_hp = 12; Level 2 Fighter → 12 + 7 = 19 (floor(10/2)+1+2); Hill Dwarf Cleric level 3 → base + 3 bonus HP; multiclass Fighter 1/Wizard 1 → Fighter HP at L1 + Wizard average at L2.
- **Action:** Implement `src/services/health.service.ts` with `calculateMaxHP(character: HydratedCharacter): number`.
- **Done when:** All HP calculation tests pass including subrace and multiclass variants.
- **Status:** `[x]`

### T-021: Implement ACService — Armor Class calculation
- **Spec:** FR-02, US-67 (AC 67.1–67.4), US-22 (Barbarian unarmored), US-28 (Monk unarmored)
- **Tests:** No armor, DEX +3 → AC 13; Leather armor (base 11) + DEX +3 → AC 14; Chain mail (base 16) + DEX +5 → AC 16 (heavy ignores DEX); Shield equipped → +2 to result; Barbarian unarmored (DEX +2, CON +3) → AC 15; Monk unarmored (DEX +3, WIS +2) → AC 15.
- **Action:** Implement `src/services/ac.service.ts` with `calculateAC(character: HydratedCharacter): number`.
- **Done when:** All AC formula tests pass.
- **Status:** `[x]`

### T-022: Implement SkillService — 18-skill bonus map
- **Spec:** US-77 (AC 77.1–77.3), US-27.4 (Jack of All Trades)
- **Tests:** Proficient Perception (WIS +2, Prof +2) → +4; Expertise Stealth (DEX +3, Prof +2) → +7; Bard non-proficient Arcana (INT +1, Prof +2) → +2 (Jack: floor(2/2)=1 added); non-Bard non-proficient → +1 (just ability mod); invalid skill `flying` rejected with error.
- **Action:** Implement `src/services/skill.service.ts` with `buildSkillBonusMap(character: HydratedCharacter): Record<SkillId, number>` and `validateSkillId(id: string): boolean`.
- **Done when:** All 18 skills produce correct bonuses; invalid skill throws validation error.
- **Status:** `[x]`

### T-023: Implement PassiveCheckService
- **Spec:** FR-12, US-76 (AC 76.1–76.5)
- **Tests:** Passive Perception with WIS +2, proficient (Prof +2) → 14; same with advantage → 19; same with disadvantage → 9; Bard without Perception proficiency (WIS +1, Prof +2) → 10 + 1 + 1 (Jack) = 12.
- **Action:** Implement `src/services/passive-check.service.ts` with `getPassivePerception`, `getPassiveInvestigation`, `getPassiveInsight`.
- **Done when:** All passive check tests pass including Jack of All Trades edge case.
- **Status:** `[x]`

### T-024: Implement CombatService — Attack bonus, Spell DC, Unarmed Strike
- **Spec:** FR-08, US-06 (AC 6.1–6.2), US-68 (AC 68.1–68.7), US-75 (AC 75.1–75.3)
- **Tests:** Longsword (no finesse), STR +3, Prof +2 → attack +5, damage 1d8+3; Rapier (finesse), DEX +4 > STR +1 → uses DEX; Unarmed Strike, STR +2 → attack = Prof + STR, damage = 1+2; Critical hit → damage dice doubled, modifiers not doubled; Spell Save DC (Cleric, WIS +3, Prof +2) → DC 13.
- **Action:** Implement `src/services/combat.service.ts`.
- **Done when:** All attack, damage, and spell DC tests pass.
- **Status:** `[x]`

### T-025: Implement CombatStateService — Death Saves, Temp HP, Instant Death
- **Spec:** US-70 (AC 70.1–70.8), US-72 (AC 72.1–72.3), US-73 (AC 73.1–73.4)
- **Tests:** Death Save nat-1 increments `death_saves_fail` by 2; nat-20 sets `current_hp = 1`; 3 successes sets `is_stable = true`; 3 failures sets `is_dead = true`; taking damage at 0 HP adds 1 failure; damage 10 vs char with 5 HP and `max_hp` 15 → `5 + 15 = 20`, damage ≥ 20 triggers instant death; temp_hp 5 absorbs first 5 damage, overflow hits `current_hp`; new temp_hp 3 does NOT replace existing temp_hp 5 (no-stack rule).
- **Action:** Implement `src/services/combat-state.service.ts` with `applyDamage`, `recordDeathSave`, `setTempHP`.
- **Done when:** All AC 70–73 tests pass.
- **Status:** `[x]`

### T-026: Implement ConditionService — 15 conditions + exhaustion
- **Spec:** US-80 (AC 80.1–80.3), US-81 (AC 81.1–81.5)
- **Tests:** Applying `paralyzed` also sets `incapacitated = true`; `blinded` character's attacks have disadvantage; `prone` character in melee range gets attacked with advantage; exhaustion level 2 halves speed; level 4 halves max_hp; level 6 sets `is_dead = true`; level 0 cannot be decremented further.
- **Action:** Implement `src/services/condition.service.ts` with `applyCondition`, `removeCondition`, `incrementExhaustion`, `decrementExhaustion`, `getActiveModifiers`.
- **Done when:** All condition and exhaustion AC tests pass.
- **Status:** `[x]`

### T-027: Implement ConcentrationService
- **Spec:** US-78 (AC 78.1–78.6)
- **Tests:** Casting a 2nd concentration spell clears the first; `active_concentration_spell_id` is null on character creation; damage 18 → CON save DC = max(10, floor(18/2)) = 9; damage 25 → DC = 12; damage 4 → DC = 10; voluntarily ending concentration sets to null; incapacitated auto-ends concentration.
- **Action:** Implement `src/services/concentration.service.ts` with `castConcentrationSpell`, `endConcentration`, `getConcentrationSaveDC`.
- **Done when:** All AC 78.1–78.6 tests pass.
- **Status:** `[x]`

### T-028: Implement SpellSlotService — Multiclass-aware progression
- **Spec:** US-79 (AC 79.1–79.6), US-82.4
- **Tests:** Wizard 3 → slots: 1st=4, 2nd=2; Fighter 5 (Eldritch Knight) → `caster_type = none` at base, no slots for non-EK; Warlock 3 → 2 slots of 2nd level, recovers on Short Rest; Wizard 3/Cleric 2 → combined caster level 5 → same as full caster level 5 slots; Paladin 2 (half-caster, floor(2/2)=1) + Bard 3 (full, 3) = caster level 4 → 1st=4, 2nd=3; casting expends slot, casting when all expended rejected.
- **Action:** Implement `src/services/spell-slot.service.ts` with `getCombinedCasterLevel`, `syncSpellSlotTracker`, `expendSlot`, `recoverSlotsOnRest`.
- **Done when:** All multiclass spell slot tests pass.
- **Status:** `[x]`

### T-029: Implement RestService — Short Rest and Long Rest
- **Spec:** FR-10, FR-11, US-71 (AC 71.1–71.5), US-86 (AC 86.1–86.6)
- **Tests:** Short Rest: spending 2 Hit Dice adds 2*(die roll + CON mod) HP, capped at max_hp; `expended_dice` increments by 2; cannot spend more dice than available; Warlock slots recover on Short Rest (not Long Rest); Bard Song of Rest adds bonus die when spending Hit Dice. Long Rest: `current_hp` restored to `max_hp`; `expended_dice` reduced by floor(total_level/2), minimum 1; all `expended_slots` reset to 0 (except Warlock); `exhaustion_level` decremented by 1; Barbarian `rage_count` reset; Fighter `action_surge` reset; cannot benefit from second Long Rest within 24h.
- **Action:** Implement `src/services/rest.service.ts` with `triggerShortRest`, `triggerLongRest`.
- **Done when:** All FR-10, FR-11, AC 71, AC 86 tests pass.
- **Status:** `[x]`

### T-030: Implement MulticlassService — Prerequisites and combined slots
- **Spec:** US-82 (AC 82.1–82.5)
- **Tests:** Adding Monk requires DEX ≥ 13 AND WIS ≥ 13 — reject if either fails; adding Fighter requires STR ≥ 13 OR DEX ≥ 13; Fighter 2/Wizard 3 → proficiency_bonus based on total level 5 → +3; Fighter 3/Paladin 2 → combined caster level = 0 + floor(2/2) = 1; Wizard 3/Cleric 2 → caster level = 5; multiclassing into Fighter grants medium armor, shields, martial weapons (not all Fighter starting proficiencies).
- **Action:** Implement `src/services/multiclass.service.ts` with `validateMulticlassPrerequisites`, `getMulticlassProficiencyGrants`, `calculateCombinedCasterLevel`.
- **Done when:** All AC 82.1–82.5 tests pass; prerequisite table covers all 12 classes.
- **Status:** `[x]`

### T-031: Implement InventoryService — Weight, encumbrance, attunement, pack unpacking
- **Spec:** FR-07, US-62 through US-69
- **Tests:** Carrying weight = sum(item.weight * quantity) + coins/50; weight > STR*15 → `is_encumbered = true`; weight > STR*30 → `speed_penalty = -25ft`; equipping heavy armor with STR < requirement → speed -10ft; attuning 4th item rejected; equipping Explorer's Pack → pack removed, 10 constituent items added; `ammunition` item has decrement function; longsword with `versatile` → toggle 1d8/1d10 grip.
- **Action:** Implement `src/services/inventory.service.ts`.
- **Done when:** All AC 62–69 tests pass.
- **Status:** `[x]`

### T-032: Implement InitiativeService
- **Spec:** FR-13, US-87 (AC 87.1–87.5)
- **Tests:** Initiative bonus = DEX modifier; Bard level 2 adds floor(Prof/2) to initiative (Jack of All Trades); character with Alert feat adds +5; tie-breaking by higher DEX modifier.
- **Action:** Implement `src/services/initiative.service.ts` with `getInitiativeBonus(character: HydratedCharacter): number`.
- **Done when:** All AC 87.1–87.4 tests pass.
- **Status:** `[x]`

### T-033: Implement XPService — Level thresholds and level-up
- **Spec:** FR-09, US-88 (AC 88.1–88.5)
- **Tests:** XP 0 → level 1; XP 299 → level 1; XP 300 → level 2, `level_up_available = true`; XP 6500 → level 5; `triggerLevelUp()` increments class level, recalculates max_hp, updates proficiency_bonus, unlocks new features; milestone mode → `xp` field ignored, level-up triggered manually; XP never decrements.
- **Action:** Implement `src/services/xp.service.ts` with `checkLevelUp`, `triggerLevelUp`.
- **Done when:** All AC 88.1–88.5 tests pass.
- **Status:** `[x]`

### T-034: Implement full Hydration Pipeline
- **Spec:** plan.md §3 (Steps 1–10)
- **Action:** Create `src/engine/hydrate.ts`. Orchestrates all services in strict order: (1) Ability Scores & Modifiers → (2) Proficiency Bonus → (3) AC → (4) Max HP → (5) Combat Calcs → (6) Spell Slots → (7) Passive Checks → (8) Encumbrance → (9) Conditions & Exhaustion → (10) Death State & Temp HP Buffer. Returns a fully computed `HydratedCharacter` object without mutating the DB input.
- **Done when:** Integration test: create a raw character from DB, run hydration, verify all derived fields are present and correctly computed.
- **Status:** `[x]`

---

## Phase 2.4 — API Implementation

### T-035: Setup Express/Fastify server with error handler
- **Spec:** plan.md §1 (API Layer), `.claude.md` §5 (Standardized Error Handling)
- **Action:** Install and configure HTTP framework. Implement global error handler that returns `{ httpStatus, developerMessage (English), clientMessage (Spanish) }` for all errors.
- **Done when:** `GET /health` returns 200; a thrown error returns the standardized JSON structure.
- **Status:** `[x]`

### T-036: Implement Character CRUD endpoints
- **Spec:** plan.md §5 (Character Management endpoints)
- **Endpoints:** `POST /characters`, `GET /characters/:id`, `PATCH /characters/:id/ability-scores`.
- **Action:** `POST` runs Point Buy validation before persisting; `GET` returns fully hydrated character (calls `hydrate.ts`); `PATCH` re-validates the entire Point Buy budget.
- **Done when:** Integration tests pass for all 3 endpoints, including rejection of invalid Point Buy.
- **Status:** `[x]`

### T-037: Implement XP and Level-Up endpoints
- **Spec:** US-88, plan.md §5
- **Endpoints:** `POST /characters/:id/xp`, `POST /characters/:id/level-up`.
- **Done when:** Adding XP updates `level_up_available`; calling level-up when not available returns 400 with `clientMessage` in Spanish.
- **Status:** `[x]`

### T-038: Implement Multiclass endpoint
- **Spec:** US-82, plan.md §5
- **Endpoint:** `POST /characters/:id/multiclass`.
- **Action:** Calls `MulticlassService.validateMulticlassPrerequisites`; on failure returns 422 with Spanish `clientMessage` naming the missing prerequisite.
- **Done when:** Attempting to add Monk without meeting DEX/WIS prerequisites returns 422 in correct format.
- **Status:** `[x]`

### T-039: Implement Feat assignment endpoint
- **Spec:** US-83, plan.md §5
- **Endpoint:** `POST /characters/:id/feats`.
- **Action:** Validates feat prerequisites and no-duplicate rule.
- **Done when:** Assigning the same feat twice returns 409; assigning a feat with unmet prerequisites returns 422.
- **Status:** `[x]`

### T-040: Implement Language endpoints
- **Spec:** US-84, plan.md §5
- **Endpoints:** `GET /characters/:id/languages`, `POST /characters/:id/languages`.
- **Action:** POST validates language exists in catalog and character doesn't already know it.
- **Done when:** Adding `common` to a character that already knows it returns 409.
- **Status:** `[x]`

### T-041: Implement Damage and Heal endpoints
- **Spec:** US-70, US-72, US-73, US-78, plan.md §5
- **Endpoints:** `POST /characters/:id/damage`, `POST /characters/:id/heal`.
- **Action:** Damage endpoint: resolves temp_hp buffer → current_hp; triggers Instant Death check; activates Death Save mode; if `active_concentration_spell_id` not null, returns `concentration_save_dc` in response body. Heal endpoint: restores HP capped at max_hp; resets Death Save counters if HP > 0.
- **Done when:** Integration tests cover all damage resolution paths including Instant Death and concentration DC.
- **Status:** `[x]`

### T-042: Implement Death Saving Throw endpoint
- **Spec:** US-70 (AC 70.1–70.8), plan.md §5
- **Endpoint:** `POST /characters/:id/death-save` (body: `{ roll: number }`).
- **Action:** Validates character is at 0 HP; applies nat-1/nat-20 rules; sets `is_dead` or `is_stable` when thresholds reached.
- **Done when:** Tests cover all 5 outcomes: normal success, normal failure, nat-1 (2 failures), nat-20 (regain 1 HP), 3 failures (death).
- **Status:** `[x]`

### T-043: Implement Temporary HP endpoint
- **Spec:** US-73 (AC 73.1–73.4), plan.md §5
- **Endpoint:** `POST /characters/:id/temp-hp` (body: `{ amount: number }`).
- **Action:** Enforces no-stack rule — only replaces if new amount is higher than current.
- **Done when:** Setting temp_hp 3 when 5 already exists leaves it at 5; setting 7 replaces it with 7.
- **Status:** `[x]`

### T-044: Implement Initiative endpoint
- **Spec:** US-87, plan.md §5
- **Endpoint:** `GET /characters/:id/initiative`.
- **Done when:** Response includes `initiative_bonus`, `modifiers` array (showing Jack of All Trades or Alert if applicable), and `roll_formula` string.
- **Status:** `[x]`

### T-045: Implement Reaction endpoint
- **Spec:** US-74 (AC 74.2), plan.md §5
- **Endpoint:** `PATCH /characters/:id/reaction`.
- **Done when:** Setting `reaction_available = false` when already false returns 422 ("Reacción ya gastada").
- **Status:** `[x]`

### T-046: Implement Condition management endpoints
- **Spec:** US-80, plan.md §5
- **Endpoints:** `POST /characters/:id/conditions/:condition_id`, `DELETE /characters/:id/conditions/:condition_id`.
- **Action:** POST validates condition_id is in the 15-condition catalog; rejects unknown conditions.
- **Done when:** Applying `paralyzed` also returns `incapacitated: true` in the response's derived state.
- **Status:** `[x]`

### T-047: Implement Exhaustion endpoint
- **Spec:** US-81, plan.md §5
- **Endpoint:** `PATCH /characters/:id/exhaustion` (body: `{ delta: 1 | -1 }`).
- **Action:** Enforces range 0–6; `exhaustion_level = 6` triggers `is_dead = true`.
- **Done when:** Incrementing from 5 to 6 sets character as dead; decrementing from 0 returns 400.
- **Status:** `[x]`

### T-048: Implement Short Rest endpoint
- **Spec:** US-71, FR-10, plan.md §5
- **Endpoint:** `POST /characters/:id/short-rest` (body: `{ hit_dice_to_spend: number }`).
- **Action:** Calls `RestService.triggerShortRest`; returns HP recovered, Hit Dice remaining, and any class Short Rest resources recovered.
- **Done when:** Spending more Hit Dice than available returns 422; Warlock spell slots are included in recovery.
- **Status:** `[x]`

### T-049: Implement Long Rest endpoint
- **Spec:** US-86, FR-11, plan.md §5
- **Endpoint:** `POST /characters/:id/long-rest`.
- **Action:** Calls `RestService.triggerLongRest`; returns HP recovered, Hit Dice recovered, spell slots recovered, resources reset.
- **Done when:** Attempting a second Long Rest within 24h returns 400 ("No puedes descansar de nuevo tan pronto").
- **Status:** `[x]`

### T-050: Implement Spell Slots and Cast endpoints
- **Spec:** US-79, US-78, plan.md §5
- **Endpoints:** `GET /characters/:id/spell-slots`, `POST /characters/:id/cast`, `DELETE /characters/:id/concentration`.
- **Action:** Cast endpoint deducts slot from `SpellSlotTracker`; if spell has `requires_concentration = true`, calls `ConcentrationService.castConcentrationSpell` (clears previous concentration first); rejects cast if no slots available at requested level.
- **Done when:** Casting a concentration spell twice keeps only the second one active; casting with no slots returns 422 with Spanish message.
- **Status:** `[x]`

### T-051: Implement Inventory endpoints
- **Spec:** US-62–US-69, plan.md §5
- **Endpoints:** `POST /characters/:id/inventory`, `PATCH /characters/:id/inventory/:item_id`, `DELETE /characters/:id/inventory/:item_id`.
- **Action:** POST triggers pack unpacking for bundle items; PATCH handles equip/unequip/attune (max 3 attuned); strength requirement and stealth disadvantage flags returned in equipped state.
- **Done when:** Adding Explorer's Pack results in 8+ individual items; attuning a 4th item returns 422.
- **Status:** `[x]`

---

## Phase 2.5 — Validation Middleware

### T-052: Implement Point Buy Guard middleware
- **Spec:** US-85 (AC 85.1–85.5), `.claude.md` §5 (Strict Validation)
- **Action:** Reusable middleware applied to `POST /characters` and `PATCH /characters/:id/ability-scores`. Uses `AbilityScoreService.validatePointBuy`. Rejects with 422 and Spanish `clientMessage` on any violation.
- **Done when:** Score of 7, score of 16, or total cost of 28 all return 422 with distinct Spanish messages.
- **Status:** `[x]`

### T-053: Implement Skill Selection Guard middleware
- **Spec:** US-77 (AC 77.3)
- **Action:** Applied to any endpoint that creates or updates `CharacterSkill`. Validates `skill_id` against the 18-skill catalog.
- **Done when:** Skill ID `flying` returns 422; all 18 valid IDs pass.
- **Status:** `[x]`

### T-054: Implement Attunement Guard middleware
- **Spec:** US-62 (AC 62.2 — attunement max 3 items)
- **Action:** Applied to `PATCH /characters/:id/inventory/:item_id` when `is_attuned = true`. Counts currently attuned items; rejects if already 3.
- **Done when:** Attempting to attune a 4th item returns 422 ("No puedes sintonizarte con más de 3 objetos").
- **Status:** `[x]`

### T-055: Implement Concentration Guard middleware
- **Spec:** US-78 (AC 78.1)
- **Action:** Applied to `POST /characters/:id/cast`. Checks if the spell has `requires_concentration = true`; if so, clears any existing `active_concentration_spell_id` before setting the new one. This is enforcement, not a rejection — it auto-clears with a warning in the response.
- **Done when:** Casting a second concentration spell returns 200 with `previous_concentration_ended: true` in the response body.
- **Status:** `[x]`

### T-056: Implement Dead Character Guard middleware
- **Spec:** US-70 (AC 70.4), US-72 (AC 72.2)
- **Action:** Applied to all action endpoints except `GET` and `/heal`. Rejects any action when `Character.is_dead = true`.
- **Done when:** Attempting to cast a spell on a dead character returns 422 ("El personaje ha muerto").
- **Status:** `[x]`

---

## Phase 2.6 — Multiclassing & Feats Validation

### T-057: Integration test — Fighter 2 / Wizard 3 spell slots
- **Spec:** US-82.4, US-79
- **Action:** Create a fixture character with Fighter level 2 (`caster_type = none`) and Wizard level 3 (`caster_type = full`). Combined caster level = 0 + 3 = 3. Expected slots: 1st=4, 2nd=2. Run `GET /characters/:id/spell-slots` and assert.
- **Done when:** Slot counts match the full caster level-3 table exactly.
- **Status:** `[x]`

### T-058: Integration test — Fighter 3 / Paladin 2 spell slots
- **Spec:** US-82.4
- **Action:** Fighter (`caster_type = none`) + Paladin level 2 (half-caster, contributes floor(2/2)=1). Combined caster level = 1. Expected slots: 1st=2.
- **Done when:** Slot counts match level-1 full caster table.
- **Status:** `[x]`

### T-059: Integration test — Cleric 3 / Paladin 2 spell slots
- **Spec:** US-82.4
- **Action:** Cleric level 3 (full, contributes 3) + Paladin level 2 (half, contributes 1). Combined caster level = 4. Expected slots: 1st=4, 2nd=3.
- **Done when:** Slot counts match level-4 full caster table.
- **Status:** `[x]`

### T-060: Integration test — Warlock 3 + Wizard 2 combined slots
- **Spec:** US-79.3 (Warlock Pact Magic separate), US-82.4
- **Action:** Warlock slots (Pact Magic, separate tracker, 2 slots of 2nd level, Short Rest recovery) + Wizard 2 (full, 2 slots of 1st level). Assert two independent slot trackers in response.
- **Done when:** Response contains both a `standard_slots` block and a `pact_magic_slots` block with correct values.
- **Status:** `[x]`

### T-061: Integration test — Full character creation flow (Human Wizard level 1)
- **Spec:** US-01 through US-05 (ability scores), US-08 (Human race), US-31 (Wizard class), US-43 (Sage background), US-77 (skills), US-84 (languages)
- **Action:** POST `/characters` with Point Buy scores, Human race (+1 all abilities), Wizard class, Sage background. Assert: modifier calculations correct; `max_hp = 6 + INT_mod` (d6); 2 skill proficiencies from class; 2 languages from Sage background; `common` + `elvish` (Human bonus). Run `GET` and verify full hydration.
- **Done when:** All computed fields match expected values from requirements.md ACs.
- **Status:** `[x]`

### T-062: Integration test — Death Saving Throw full flow
- **Spec:** US-70 (all ACs)
- **Action:** Create character, reduce HP to 0, record 2 death save failures, record nat-1 (total failures = 4 → death). Second run: record 2 successes + nat-20 (regains 1 HP, counters reset).
- **Done when:** Both paths (death and recovery via nat-20) produce correct state transitions.
- **Status:** `[x]`

### T-063: Integration test — Long Rest full resource recovery
- **Spec:** US-86 (all ACs), US-71.4, US-79.6
- **Action:** Create Barbarian 5: spend all rages (ResourcePool), expend all Hit Dice (HitDiceTracker), cast all spell slots if any. Trigger Long Rest. Assert: `current_hp = max_hp`; `expended_dice` reduced by floor(5/2)=2; `rage_count` reset; Warlock slots NOT recovered (if multiclassed).
- **Done when:** All AC 86.1–86.6 assertions pass.
- **Status:** `[x]`

---

---

## Phase 2.7 — Wizard UX: Selección de Habilidades Guiada

> **Problema raíz:** El paso 4 del wizard (selección de habilidades) causa re-renders completos asíncronos en cada click, haciendo que los checkboxes parezcan no responder. Además, los jugadores nuevos no tienen contexto para elegir habilidades sin descripción ni guía.

### US-108: Respuesta inmediata de checkboxes en el wizard

- **Problema:** Cada click en una habilidad dispara `wizRenderStep(4)` (async con llamadas API), causando que la UI tarde 200–600ms en actualizarse, o que re-renders concurrentes se sobreescriban mutuamente.
- **Solución:** Las funciones `wizToggleSkill`, `wizToggleCantrip` y `wizToggleSpell` deben actualizar el elemento clicado en-place (sin re-render completo), y sólo actualizar el estado visual de los demás ítems afectados (desactivar/activar según el límite alcanzado).
- **AC:**
  - 108.1: Clicar una habilidad no seleccionada la marca visualmente de forma inmediata (< 16ms).
  - 108.2: Clicar una habilidad ya seleccionada la desmarca visualmente de forma inmediata.
  - 108.3: Al alcanzar el máximo permitido, las habilidades no seleccionadas se muestran desactivadas sin re-render.
  - 108.4: Al desmarcar una habilidad cuando se está al máximo, el resto se reactiva de inmediato.
  - 108.5: El mismo comportamiento aplica a trucos y conjuros iniciales.
- **Status:** `[x]`

### US-109: Descripción contextual de habilidades para jugadores nuevos

- **Problema:** El wizard solo muestra el nombre de la habilidad. Un jugador nuevo no sabe qué significa "Perspicacia" ni para qué sirve "Juego de Manos".
- **Solución:** Cada habilidad en el wizard muestra: (1) la característica que la rige (FUE/DES/CON/INT/SAB/CAR), (2) una descripción breve en español de sus usos típicos, y (3) el bono esperado del personaje basado en las puntuaciones elegidas en el paso 1 y los bonificadores raciales del paso 2.
- **AC:**
  - 109.1: Cada fila de habilidad muestra el nombre de la característica rectora (e.g. "DES") con color de acento.
  - 109.2: Cada fila muestra una descripción de 1–2 líneas que explica cuándo se usa la habilidad.
  - 109.3: Cada fila muestra el bono total esperado (+X) calculado desde las puntuaciones de característica actuales del wizard (base + raza).
  - 109.4: Las habilidades ya dominadas por el trasfondo se muestran pre-marcadas y desactivadas (no se pueden desmarcar).
  - 109.5: El diseño visual soporta el doble de altura por fila sin romper el layout del wizard.
- **Status:** `[x]`

---

## Phase 2.8 — Edición de Personajes y Nivel Inicial

> **Problema raíz:** Los personajes sólo pueden crearse en nivel 1. Muchos grupos de DnD comienzan aventuras a nivel 3, 5 u otro nivel arbitrario (one-shots, campañas avanzadas). Además, no existe forma de editar un personaje ya creado sin borrarlo y rehacerlo.

### US-110: Editar personaje existente

- **Problema:** Una vez creado, no se puede editar el nombre, características, alineamiento, nivel ni PG actual de un personaje sin eliminarlo.
- **Solución:** Agregar un modal de edición accesible desde la tarjeta del roster que permita modificar los campos básicos del personaje y recalcule automáticamente sus estadísticas derivadas.
- **Backend:** `PATCH /characters/:id` acepta `name`, `alignment`, `current_hp`, `ability_scores`, y `level`. Cuando `level` cambia: actualiza `character_classes.class_level`, recalcula `max_hp`, regenera `spell_slot_tracker` y `resource_pool` para el nuevo nivel, actualiza `xp` al mínimo del nuevo nivel.
- **AC:**
  - 110.1: El roster muestra un botón "Editar" en cada tarjeta de personaje.
  - 110.2: El modal de edición precarga los valores actuales del personaje.
  - 110.3: Cambiar el nombre y guardarlo actualiza la tarjeta del roster en tiempo real.
  - 110.4: Cambiar el nivel recalcula y actualiza HP máx, XP, espacios de conjuro y reservas de recursos.
  - 110.5: Las puntuaciones de característica editadas pasan por la validación de Point Buy antes de guardarse.
  - 110.6: Al guardar, si el personaje está abierto en la hoja de personaje, ésta se recarga automáticamente.
- **Status:** `[x]`

### US-111: Selección de nivel inicial en el wizard de creación

- **Problema:** El wizard siempre crea personajes en nivel 1. Para campañas que comienzan en otro nivel, hay que editar el personaje manualmente después.
- **Solución:** Agregar un selector de nivel (1–20) en el Paso 1 del wizard. El nivel seleccionado determina el XP inicial, los PG máximos, los espacios de conjuro iniciales, los dados de golpe y las reservas de recursos. Las selecciones de trucos y conjuros del Paso 4 siguen usando los recuentos de inicio de clase (`starting_cantrip_count`, `starting_spells_known`).
- **Backend:** `POST /characters` acepta `initial_level` (int 1–20, default 1). Si `initial_level > 1`: `xp = XP_THRESHOLDS[initial_level]`, `class_level = initial_level`, HP calculado como L1 máx + (N-1)×(avg+CON), `spell_slot_tracker` generado para ese nivel, `hit_dice_tracker.max_dice = initial_level`, resource pools escalados al nivel.
- **AC:**
  - 111.1: El Paso 1 del wizard muestra un selector "Nivel de inicio" (1–20).
  - 111.2: Al cambiar el nivel se muestra el XP mínimo correspondiente debajo del selector.
  - 111.3: Un personaje creado a nivel 5 tiene `xp = 6500`, `class_level = 5`, y los espacios de conjuro de nivel 5.
  - 111.4: Los PG máximos de un personaje de nivel 5 son: dado de golpe (máx) + CON×1 + promedio×4 + CON×4.
  - 111.5: Los dados de golpe disponibles reflejan el nivel inicial (`max_dice = initial_level`).
- **Status:** `[x]`

---

## Phase 2.9 — Wizard Mobile-First basado en Create Character.pdf

> **Problema raíz:** El wizard funcional existente no respetaba la arquitectura visual ni la secuencia de información del PDF aprobado. Además, la pantalla "Atributos del personaje" mostraba valores base de Point Buy como número principal, ocultando que los bonos raciales ya deben previsualizarse automáticamente.

### US-112: Flujo de creación PDF + preview de atributos finales

- **Problema:** El jugador ve `8` en Fuerza al llegar a atributos aunque ya eligió una raza como Dracónido que aporta `+2`. Eso contradice el flujo esperado: el UI debe explicar que el valor usable es `10`, mientras el sistema conserva `8` como base para validar Point Buy.
- **Solución:** Rearquitecturar el wizard como pantallas del PDF: selección → "Tu selección" → paso siguiente. En atributos, cada tarjeta muestra como número principal `base_score + racial_bonus`, y debajo el desglose explícito, por ejemplo `Base 8 + +2 raza = 10`.
- **Frontend:** `ui.html` mantiene `wiz.data.ability_scores` como valores base y calcula el preview racial en la pantalla de atributos. `wizPBAdj()` actualiza in-place el total final, costo base, fórmula y presupuesto restante.
- **Documentación:** `requirements.md` agrega US-112; `plan.md` agrega Section 7; `.claude.md` agrega el contrato de trazabilidad del flujo PDF.
- **AC:**
  - 112.1: La secuencia del wizard sigue `docs/Create Character.pdf` con pantallas de revisión "Tu selección".
  - 112.2: La pantalla de atributos muestra el score final como número principal.
  - 112.3: Cada atributo muestra el razonamiento `Base X + Y raza = Z`.
  - 112.4: El payload de creación conserva únicamente los valores base de Point Buy en `ability_scores`.
  - 112.5: Incrementar o decrementar un atributo actualiza el preview racial sin re-render completo.
- **Status:** `[x]`

### US-113: Lenguaje visual mobile del PDF

- **Problema:** El wizard había heredado una paleta black/gold moderna que no corresponde al PDF aprobado. Los botones, superficies, tipografías y labels se percibían como otro producto.
- **Solución:** Aplicar tokens visuales derivados del PDF: fondo café profundo, cards café medio, texto crema, acentos tan/dorado, CTA rojo y títulos serif.
- **Frontend:** `ui.html` redefine los tokens mobile-first dentro del breakpoint móvil y ajusta wizard/cards/buttons/forms para usar la estética del PDF y del Figma conectado (`DM-Dnd-App--Copy-`, sección `Create Character` / `2015:2689`).
- **AC:**
  - 113.1: El wizard móvil no usa fondo negro/azul como base visual.
  - 113.2: El CTA principal "Siguiente" es rojo `#720000` con texto claro.
  - 113.3: Cards y badges usan superficies café con bordes/acento tan.
  - 113.4: Títulos del wizard usan `Prata`; secciones/botones usan `Pragati Narrow`; labels/cards usan `Roboto`.
  - 113.5: Los textos visibles del wizard usan wording español alineado al PDF.
  - 113.6: El header del wizard usa back affordance + título centrado + 5 barras horizontales de progreso, no chips numerados.
  - 113.7: La pantalla de atributos conserva grid 3×2 en móvil, con total final y fórmula explícita por atributo.
- **Status:** `[x]`

---

---

## Phase 2.10 — Catálogo completo: descripciones SRD + homebrew (US-127)

### T-068: Agregar campos description y source al modelo Item
- **Spec:** US-127
- **Action:** Agregar `description String?` y `source String @default("srd")` a `model Item` en `prisma/schema.prisma`. Crear migración `20260509120000_add_item_description_source`.
- **Done when:** `npx prisma migrate deploy` corre sin errores y las columnas existen en BD.
- **Status:** `[x]`

### T-069: Escribir descripciones de sabor para los 287 ítems SRD
- **Spec:** US-127
- **Action:** Crear `SRD_DESC` dict con descripciones en español, tono DnD clásico, para todas las categorías: armaduras, armas, equipo, herramientas, instrumentos, packs, pociones, focos y objetos mágicos.
- **Done when:** Todos los ítems SRD en `item.ts` tienen `description` no vacío y `source: 'srd'`.
- **Status:** `[x]`

### T-070: Extraer e integrar 568 ítems homebrew desde PDFs
- **Spec:** US-127
- **Action:** Parsear los 4 PDFs en `docs/` (magic40, infernal, gremio, todasarmas) con scripts Python. Deduplicar y agregar al array de items en `prisma/seeds/item.ts` con `source`, `rarity`, `requires_attunement` y `description`.
- **Done when:** 568 ítems homebrew presentes en `item.ts` con source tag correcto.
- **Status:** `[x]`

### T-071: Generar XLS catálogo completo
- **Spec:** US-127
- **Action:** Generar y regenerar `Catálogo Completo DnD.xlsx` desde `prisma/seeds/item.ts` con 855 ítems (287 SRD + 568 homebrew), color por rareza/fuente y hojas de revisión: Resumen, Catálogo Completo, SRD 5.1, Homebrew.
- **Done when:** Archivo existe, contiene 855 ítems y sirve como fuente de QA para revisar descripciones, rarezas, fuentes y origen SRD/homebrew.
- **Notas 2026-05-09:** XLS regenerado después del rollback de US-145 para mantener una fuente limpia de revisión de catálogo sin depender de íconos SVG.
- **Status:** `[x]`

### T-072: Conectar description a la UI del modal de ítem (pendiente)
- **Spec:** US-127 AC 127.1–127.4
- **Action:** En `ui.html`, leer el campo `description` del ítem hidratado y mostrarlo en el modal de detalle. Solo necesita un `<p>` adicional en el template del modal.
- **Done when:** El modal de ítem muestra la descripción de sabor debajo de los stats.
- **Status:** `[ ]`

### T-073: Rollback de íconos SVG genéricos de ítems
- **Spec:** US-145
- **Action:** Revertir la implementación temporal de íconos SVG genéricos en inventario: eliminar sprite inline, helpers JS (`getItemIconId`, `getItemIconStyle`, `itemIconHtml`), llamadas de render y CSS `.item-icon-wrap`.
- **Done when:** `ui.html` y `style.css` ya no contienen el sistema de íconos SVG genéricos y la UI queda lista para una futura solución basada en imágenes únicas o un sistema visual aprobado.
- **Notas 2026-05-09:** Rollback realizado por decisión de producto. US-145 queda pendiente/revertida.
- **Status:** `[x]`

### T-074: Rediseñar identidad visual de ítems sin SVG genéricos
- **Spec:** US-145
- **Action:** Definir la arquitectura visual para ítems del catálogo (por ejemplo: imágenes únicas por ítem, assets por fuente, CDN controlado o almacenamiento propio) antes de volver a implementarla en la UI.
- **Done when:** Existe una decisión documentada y validada con el usuario sobre cómo se representará visualmente cada ítem sin usar íconos vectoriales genéricos.
- **Notas 2026-05-09:** Primer enfoque validado en código: assets locales en `src/images/items`, mapping exacto por nombre SRD y fallback por subtipo para armas/magic items.
- **Status:** `[~]`

### T-075: Expandir cobertura progresiva de imágenes de ítems
- **Spec:** US-145
- **Action:** Agregar nuevas imágenes locales al mapping de `ui.html` usando prioridad: ítem exacto → subtipo de arma/objeto → sin imagen. Evitar íconos SVG genéricos.
- **Done when:** Cada lote nuevo de imágenes queda asignado a ítems concretos o a subtipos con fallback documentado, sin romper cards existentes de inventario/catálogo/cantidad.
- **Status:** `[~]`

### T-076: Integrar librería visual Game-icons con color por rareza
- **Spec:** US-145
- **Action:** Usar Game-icons vía Iconify como fallback para ítems sin imagen local, con mapeo por categoría/subtipo y tema cromático por rareza.
- **Done when:** Las cards muestran imagen local si existe; si no, icono de Game-icons con color de rareza para objetos mágicos. La atribución CC BY 3.0 queda documentada en `README.md`.
- **Status:** `[x]`

### T-077: Migrar UI móvil al New Style de Figma
- **Spec:** US-146
- **Action:** Aplicar la sección `pantallas template` del Figma `New-style` a Home/Personajes, personaje abierto e Inventario usando los fondos locales de `src/images`, tokens CSS derivados del Figma y drawer de descripción de objeto.
- **Done when:** Home usa navegación inferior y card de personaje del template; personaje abierto muestra resumen, XP, imagen, atributos, magia y PG en parchment; inventario muestra tabs Equipo/Mochila/Alijo, card de Carga/monedas, slots vacíos, cards de objetos del template, patrón colapsable anotado y modal `Descripción` al tocar un objeto.
- **Notas 2026-05-09:** Primera pasada implementada en `ui.html` y `style.css`. Se agregaron tokens `--figma-*` para colores, tipografías, espaciados, tamaños, radios, sombras y assets. La card de inventario ya separa daño/atributos por comas, precio/peso, acciones y CTA por tipo de objeto. El modal de descripción fue corregido para no ser drawer inferior. Falta QA visual en navegador para ajustar medidas finas, modales y pantallas secundarias.
- **Notas 2026-05-11:** La card de personaje del roster fue reordenada a nombre → raza/clase → divider rojo → métricas → biografía, con menú táctil de tres puntos para `Editar`/`Eliminar`. Falta QA visual contra Figma para escala exacta e iconografía fina.
- **Status:** `[~]`

---

## Summary

| Phase | Tasks | Total |
| :--- | :--- | :--- |
| 2.1 Database Provisioning | T-001 → T-005 | 5 |
| 2.2 Master Seeding | T-006 → T-017 | 12 |
| 2.3 Logic Services (TDD) | T-018 → T-034 | 17 |
| 2.4 API Implementation | T-035 → T-051 | 17 |
| 2.5 Validation Middleware | T-052 → T-056 | 5 |
| 2.6 Multiclassing & Integration Tests | T-057 → T-063 | 7 |
| 2.7 Wizard UX — Selección de Habilidades | US-108, US-109 | 2 |
| 2.8 Edición de Personajes y Nivel Inicial | US-110, US-111 | 2 |
| 2.9 Wizard Mobile-First PDF | US-112, US-113 | 2 |
| 2.10 Catálogo completo SRD + Homebrew | T-068 → T-076 | 9 |
| 2.11 New Style UI templates | T-077 | 1 |
| **TOTAL** | | **79 tasks** |
