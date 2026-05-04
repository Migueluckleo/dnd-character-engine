# Phase 2: Architecture & Implementation Plan - `plan.md`

## 1. Tech Stack & Architecture Pattern

To guarantee the strict separation of D&D logical rules from database operations and API requests, the system will use an **N-Tier Architecture** built on modern TypeScript.

* **Runtime:** Node.js
* **Language:** TypeScript (Strict Mode enabled).
* **Database:** PostgreSQL.
* **ORM:** Prisma ORM (Type-safe).
* **Architecture Layers:**
    1.  **API / Controllers:** Handles requests and input validation (e.g., Point Buy validation, multiclass prerequisites, feat eligibility).
    2.  **Service Layer (The Engine):** Pure logical functions derived from `requirements.md`. Calculates modifiers, AC, HP, combat state, conditions, spell slots, and rest recovery. **Services must never mutate input data** — they always return new computed values.
    3.  **Repository / DAL:** Handles all database I/O via Prisma. No business logic lives here.

---

## 2. Database Schema (PostgreSQL via Prisma)

### 2.1 Static Catalogs (Reference Data)
*These tables store the "Rules" seeded from the SRD 5.1 manual. They are read-only at runtime.*

| Table Name | Key | Description |
| :--- | :--- | :--- |
| `Race` | `race_id` | Base race/subrace data: `size` (enum: tiny/small/medium/large), `base_speed`, ability bonuses as JSONB, `darkvision_radius`. |
| `Class` | `class_id` | Base class data: `hit_die` (e.g., 10), saving throw proficiency keys, `caster_type` (enum: `full` / `half` / `warlock` / `none`), `multiclass_proficiencies` JSONB. |
| `Subclass` | `subclass_id` | Archetypes, Domains, Circles, Oaths, etc. Includes `unlock_level`. |
| `Background` | `background_id` | Fixed gold, skill proficiencies, language grants, and tool proficiency rules as JSONB. |
| `Trait` | `trait_id` | Racial/Class features (e.g., *Relentless Endurance*, *Fey Ancestry*, *Rage*). Includes structured `effects` JSONB for engine hydration. |
| `Item` | `item_id` | Master catalog: Weapons, Armor, Gear, Tools. Includes `requires_concentration` = false always (items don't concentrate). Weapon fields: `damage_dice`, `damage_type`, `properties` JSONB (finesse, heavy, light, thrown, versatile, two_handed, range_normal, range_long, ammunition). Armor fields: `armor_category` (enum: light/medium/heavy/shield), `ac_base`, `strength_requirement`, `stealth_disadvantage`. |
| `Spell` | `spell_id` | All spells: `level` (0–9), `school`, `casting_time`, `duration`, `requires_concentration` (boolean), `spellcasting_ability`, `effects` JSONB. |
| `Feature` | `feature_id` | Class features (e.g., *Action Surge*, *Divine Sense*) and their resource costs, reset trigger (short_rest / long_rest). |
| `Language` | `language_id` | Full language catalog: `name`, `type` (enum: `standard` / `exotic`). Seeds: `common`, `dwarvish`, `elvish`, `giant`, `gnomish`, `goblin`, `halfling`, `orc`, `abyssal`, `celestial`, `draconic`, `deep_speech`, `infernal`, `primordial`, `sylvan`, `undercommon`. |
| `Feat` | `feat_id` | Feat catalog: `name`, `description`, `prerequisite` JSONB (e.g., ability score minimums, race, proficiency), `effects` JSONB (structured for engine hydration), `repeatable` boolean. |
| `SpellSlotProgression` | `(class_id, class_level, slot_level)` | Composite key. Stores `max_slots` for each combination. Encodes full caster, half caster, and Warlock Pact Magic tables. Includes `slot_source` (enum: `standard` / `pact_magic`) and `rest_recovery` (enum: `long_rest` / `short_rest`). |

---

### 2.2 Transactional Data (Character State)
*These tables store the mutable "Character" state.*

| Table Name | Columns |
| :--- | :--- |
| **`Character`** | `id`, `user_id`, `name`, `race_id`, `background_id`, `alignment`, `xp`, `milestone_leveling` (boolean, default false), `level_up_available` (boolean), `base_str`, `base_dex`, `base_con`, `base_int`, `base_wis`, `base_cha`, `current_hp`, `temp_hp`, `is_dead` (boolean, default false), `active_concentration_spell_id` (nullable FK → `KnownSpell.id`), `cp`, `sp`, `ep`, `gp`, `pp`, `death_saves_success`, `death_saves_fail`, `has_inspiration`, `base_speed`, `darkvision_radius` |
| **`CharacterClass`** | `character_id`, `class_id`, `subclass_id` (nullable), `class_level`, `is_primary` |
| **`CharacterSkill`** | `character_id`, `skill_id`, `is_proficient` (boolean), `is_expertise` (boolean). Matches US-27.4 & US-77. |
| **`CharacterTool`** | `character_id`, `tool_id`, `is_expertise` (boolean). Matches US-46.4. |
| **`CharacterTrait`** | `character_id`, `trait_id` — Junction for active racial/class traits. |
| **`CharacterFeat`** | `character_id`, `feat_id` — Junction for acquired feats. Matches US-83. |
| **`CharacterLanguage`** | `character_id`, `language_id` — Junction for known languages. Matches US-84. |
| **`InventoryItem`** | `id`, `character_id`, `item_id`, `quantity`, `is_equipped`, `is_attuned`. Matches US-62 & US-67. |
| **`KnownSpell`** | `id`, `character_id`, `spell_id`, `is_prepared`. Matches US-31 & US-41. |
| **`SpellSlotTracker`** | `character_id`, `class_id` (for multiclass separation), `slot_level`, `max_slots`, `expended_slots`, `slot_source` (standard / pact_magic). |
| **`HitDiceTracker`** | `character_id`, `die_type`, `max_dice`, `expended_dice`. Matches US-22.5 & US-71. |
| **`ResourcePool`** | `character_id`, `pool_id` (e.g., `ki`, `rage`, `lay_on_hands`, `bardic_inspiration`), `current`, `max`, `reset_on` (enum: `short_rest` / `long_rest`). |
| **`ActiveState`** | `character_id`, `exhaustion_level` (integer 0–6), `reaction_available` (boolean), and one boolean column per condition: `is_blinded`, `is_charmed`, `is_deafened`, `is_frightened`, `is_grappled`, `is_incapacitated`, `is_invisible`, `is_paralyzed`, `is_petrified`, `is_poisoned`, `is_prone`, `is_restrained`, `is_stunned`, `is_unconscious`. Note: `exhaustion` level 6 triggers `is_dead` on `Character`. |

---

## 3. The Hydration & Calculation Flow (Engine Logic)

The Engine MUST calculate all derived values in real-time. **No derived value may be stored statically in the DB.** The hydration pipeline runs in the following strict order:

### Step 1 — Ability Scores & Modifiers
`total_score = base_score + racial_bonus + asi_bonus + feat_bonus`
`modifier = floor((total_score - 10) / 2)`
Applied to all six scores. Enforces minimum of 1 per score (FR-06).

### Step 2 — Proficiency Bonus
`proficiency_bonus = f(total_character_level)` → +2 at levels 1–4, +3 at 5–8, +4 at 9–12, +5 at 13–16, +6 at 17–20. Always derived from the **sum of all `CharacterClass.class_level`** values, never from a single class (FR-05, US-82.5).

### Step 3 — Armor Class (AC)
1. Check `InventoryItem` for equipped armor (`is_equipped = true`, `armor_category` in [light, medium, heavy]).
2. If armored: `ac = Item.ac_base + dex_modifier` (capped by category: light = uncapped, medium = max +2, heavy = 0 dex).
3. If unarmored: `ac = 10 + dex_modifier`. Apply Barbarian override (`10 + dex + con`) or Monk override (`10 + dex + wis`) if `CharacterClass` contains those classes (US-22, US-28).
4. Apply `shield` bonus (+2) if a shield is equipped.

### Step 4 — Maximum HP
1. Identify primary class hit die from `Class.hit_die`.
2. `max_hp = hit_die_max + con_modifier` (level 1 portion).
3. For each level beyond 1: `max_hp += floor(hit_die / 2) + 1 + con_modifier` (minimum 1 per level).
4. For multiclass levels: add hit die average per class for those levels (US-82.2).
5. Apply trait overrides: `ToughnessFeat` (+2/level), `HillDwarfTrait` (+1/level), `DraconicResilienceTrait` (+1/level).
6. At `exhaustion_level >= 4`: `effective_max_hp = floor(max_hp / 2)`. If `current_hp > effective_max_hp`, reduce `current_hp` to match (US-81.3).

### Step 5 — Combat Calculations
* **Attack Bonus:** `proficiency_bonus + (str_modifier or dex_modifier)`. If weapon has `finesse` property, use the higher of the two modifiers (US-68.3).
* **Unarmed Strike:** Attack = `proficiency_bonus + str_modifier`. Damage = `1 + str_modifier` (minimum 1). Monk override applies (US-75).
* **Spell Save DC:** `8 + proficiency_bonus + spellcasting_ability_modifier` (US-37, US-38 etc.).
* **Spell Attack Bonus:** `proficiency_bonus + spellcasting_ability_modifier`.
* **Critical Hit:** Double the number of damage dice only. Flat modifiers are not doubled (FR-08).

### Step 6 — Spell Slots (Multiclass-Aware)
1. For each `CharacterClass`, determine `caster_type` from `Class` catalog.
2. Calculate **combined caster level**: full-caster classes contribute their full level; half-caster classes contribute `floor(class_level / 2)`.
3. Look up combined caster level in `SpellSlotProgression` to determine `max_slots` per slot level. Sync with `SpellSlotTracker`.
4. Warlock Pact Magic is tracked independently in a separate `SpellSlotTracker` row with `slot_source = pact_magic` and `rest_recovery = short_rest` (US-79.3, US-82.4).

### Step 7 — Passive Checks
`passive_perception   = 10 + perception_bonus   [+ 5 if advantage, - 5 if disadvantage]`
`passive_investigation = 10 + investigation_bonus`
`passive_insight      = 10 + insight_bonus`
Each `_bonus` includes proficiency and expertise from `CharacterSkill`. Bard Jack of All Trades adds `floor(proficiency_bonus / 2)` to unproficient skills (US-76, US-27.4).

### Step 8 — Encumbrance
`carried_weight = sum(Item.weight * InventoryItem.quantity) + (total_coins / 50)`
Compare vs. `str_score * 15` (carrying capacity) and `str_score * 30` (push/drag/lift). Flag `is_encumbered` in `ActiveState` when exceeded (FR-07).

### Step 9 — Conditions & Exhaustion Modifiers
Read `ActiveState` and apply all active condition effects to the character's derived stats:
* `is_blinded`, `is_prone`, `is_restrained`, etc. → flag affected rolls for Advantage/Disadvantage.
* `exhaustion_level >= 1` → Disadvantage on ability checks.
* `exhaustion_level >= 2` → `effective_speed = floor(base_speed / 2)`.
* `exhaustion_level >= 3` → Disadvantage on attack rolls and saving throws.
* `exhaustion_level >= 4` → Already handled in Step 4 (`max_hp` halved).
* `exhaustion_level >= 5` → `effective_speed = 0`.
* `exhaustion_level == 6` → Set `Character.is_dead = true` (US-81).

### Step 10 — Death State & Temporary HP Buffer
* If `current_hp == 0` and `temp_hp == 0`, activate Death Save mode (`is_unconscious = true` in `ActiveState`).
* If `current_hp == 0` but `temp_hp > 0`, character is **not** unconscious.
* Damage resolution order: `temp_hp` is depleted first; overflow goes to `current_hp`.
* Instant Death check: if `damage_taken >= current_hp + max_hp` in a single hit, set `is_dead = true` bypassing Death Saves (US-72, US-73).

---

## 4. Engine Services (Service Layer)

All services are **pure functions** — no side effects, no DB calls, no input mutation. They accept typed inputs and return new computed values.

| Service | Responsibilities | Matches |
| :--- | :--- | :--- |
| `MathService` | Modifier formula, proficiency bonus lookup, floor enforcement. | FR-01, FR-05 |
| `AbilityScoreService` | Point Buy cost validation (27-point budget, non-linear costs 8–15), ASI application, score floor/ceiling enforcement. | US-01, US-85 |
| `HealthService` | Max HP calculation with class/subrace/feat overrides; HP scaling per level; multiclass HP. | FR-03, FR-04, US-82.2 |
| `ACService` | Armor category detection, AC formula by armor type, Barbarian/Monk unarmored overrides. | FR-02, US-67 |
| `CombatService` | Attack bonus, spell DC, spell attack bonus, finesse resolution, critical hit dice doubling, unarmed strike formula, Opportunity Attack eligibility and reaction cost. | FR-08, US-68, US-74, US-75 |
| `PassiveCheckService` | Calculates passive_perception, passive_investigation, passive_insight. Applies Jack of All Trades for Bards. | FR-12, US-76 |
| `SkillService` | Builds skill bonus map from `CharacterSkill` + ability modifiers. Validates skill catalog (18 skills). | US-77, US-27 |
| `SpellSlotService` | Calculates combined caster level for multiclassing; syncs `SpellSlotTracker` with `SpellSlotProgression`; handles Warlock Pact Magic separately. | US-79, US-82.4 |
| `ConcentrationService` | Tracks `active_concentration_spell_id`; auto-clears on new concentration spell; calculates CON save DC on damage (`max(10, floor(damage / 2))`). | US-78 |
| `RestService` | `triggerShortRest()`: validates Hit Dice pool, computes HP recovery (die roll + CON mod), triggers class Short Rest features (Song of Rest, Warlock slots). `triggerLongRest()`: restores all HP, recovers `floor(level/2)` Hit Dice (min 1), resets all expended spell slots, resets Long Rest class resources, reduces `exhaustion_level` by 1. | US-71, US-86, FR-10, FR-11 |
| `CombatStateService` | Death Saving Throw logic (nat 1 = 2 failures, nat 20 = regain 1 HP), Temp HP buffer damage resolution, Instant Death check, reaction tracking (`reaction_available`). | US-70, US-72, US-73, US-74 |
| `ConditionService` | Apply/remove condition flags in `ActiveState`; compute all condition-derived modifiers (Advantage/Disadvantage on rolls, speed changes, auto-fails). Manages `exhaustion_level` increments/decrements. | US-80, US-81 |
| `MulticlassService` | Validates ability score prerequisites before adding a new class; computes combined spell slots; grants correct subset of multiclassing proficiencies (not full starting proficiencies). | US-82 |
| `InventoryService` | Weight/encumbrance calculation, attunement slot enforcement (max 3), equipment pack unpacking, strength requirement speed penalty. | US-62–US-69, FR-07 |
| `InitiativeService` | Calculates initiative bonus (`dex_modifier`); applies Jack of All Trades (Bard), Alert feat (+5); handles tie-breaking logic. | FR-13, US-87 |
| `XPService` | XP accumulation, level threshold lookup, `level_up_available` flag, `triggerLevelUp()` orchestration (class level increment, max_hp recalc, proficiency bonus update, feature unlocks, slot sync). Supports milestone mode. | FR-09, US-88 |

---

## 5. API Endpoints

All responses use consistent JSON structure. Errors include `httpStatus`, `developerMessage` (English), and `clientMessage` (Spanish).

### Character Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/characters` | Create a new character (runs Point Buy validation via `AbilityScoreService`). |
| `GET` | `/characters/:id` | Returns fully hydrated character sheet (all 10 engine steps applied). |
| `PATCH` | `/characters/:id/ability-scores` | Update base ability scores; validates Point Buy budget. |
| `POST` | `/characters/:id/level-up` | Triggers `XPService.triggerLevelUp()`. |
| `POST` | `/characters/:id/xp` | Add XP; updates `level_up_available` flag. |
| `POST` | `/characters/:id/multiclass` | Add a new class entry; runs `MulticlassService` prerequisite check. |
| `POST` | `/characters/:id/feats` | Assign a feat; validates prerequisites and no-duplicate rule. |
| `GET` | `/characters/:id/languages` | List known languages. |
| `POST` | `/characters/:id/languages` | Add a language; validates against catalog and no-duplicate rule. |

### Combat & State
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/characters/:id/damage` | Apply damage: resolves Temp HP buffer → `current_hp`; triggers Instant Death check; activates Death Save mode; if concentrating, computes CON Save DC. |
| `POST` | `/characters/:id/heal` | Restore HP (capped at `max_hp`); resets Death Save counters if `current_hp > 0`. |
| `POST` | `/characters/:id/death-save` | Record a Death Saving Throw result (value 1–20); applies nat-1 / nat-20 special rules. |
| `POST` | `/characters/:id/temp-hp` | Set Temporary HP (no-stack rule enforced). |
| `GET` | `/characters/:id/initiative` | Returns `initiative_bonus` and any modifiers (Alert, Jack of All Trades). |
| `PATCH` | `/characters/:id/reaction` | Set `reaction_available` to true (start of turn reset) or false (reaction spent). |

### Conditions & Exhaustion
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/characters/:id/conditions/:condition_id` | Apply a condition. |
| `DELETE` | `/characters/:id/conditions/:condition_id` | Remove a condition. |
| `PATCH` | `/characters/:id/exhaustion` | Increment or decrement `exhaustion_level` (validated within 0–6 range). |

### Rests & Resources
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/characters/:id/short-rest` | Triggers `RestService.triggerShortRest()`. Body includes `hit_dice_to_spend` array. |
| `POST` | `/characters/:id/long-rest` | Triggers `RestService.triggerLongRest()`. Validates 24h cooldown. |
| `POST` | `/characters/:id/hit-dice` | Spend a hit die during a Short Rest. |

### Spells & Concentration
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/characters/:id/spell-slots` | Returns current `SpellSlotTracker` state for all slot levels. |
| `POST` | `/characters/:id/cast` | Cast a spell: deducts slot, applies concentration rules (AC 78.1 — previous spell ends). |
| `DELETE` | `/characters/:id/concentration` | Voluntarily end concentration. |

### Inventory
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/characters/:id/inventory` | Add item; triggers pack unpacking if item is an equipment pack. |
| `PATCH` | `/characters/:id/inventory/:item_id` | Equip/unequip/attune item; runs attunement slot check (max 3). |
| `DELETE` | `/characters/:id/inventory/:item_id` | Remove item. |

---

## 6. Implementation Roadmap

### Phase 2.1: Database Provisioning
Set up PostgreSQL + Prisma. Define `schema.prisma` using the exact table names and column nomenclatures from Section 2. Enable strict `@@unique` constraints and FK cascades. Run `prisma migrate dev` to initialize.

### Phase 2.2: Master Seeding
Populate all static catalogs with SRD 5.1 data in the following order (respecting FK dependencies):
1. `Language` (16 entries)
2. `Race` (9 races + subraces, including Gnome with `size = small`)
3. `Class` (12 classes with `hit_die`, `caster_type`, `multiclass_proficiencies`)
4. `Subclass` (archetypes per class)
5. `Background` (13 backgrounds with language grants)
6. `Trait` (racial and class features with structured `effects` JSONB)
7. `Feature` (class features per level with `reset_on` field)
8. `Spell` (full SRD spell list with `requires_concentration` boolean populated correctly)
9. `Item` (weapons with `properties` JSONB, armor with category and strength requirements)
10. `Feat` (standard 5e feats with prerequisites and `effects` JSONB)
11. `SpellSlotProgression` (full caster, half caster, and Warlock Pact Magic tables for levels 1–20)

### Phase 2.3: Logic Services (Test-Driven)
Implement all services from Section 4. Each service must have unit tests written **before** its implementation (TDD). Tests must verify acceptance criteria from `requirements.md`. Priority order:
1. `MathService`, `AbilityScoreService` (foundation — all other services depend on modifiers)
2. `HealthService`, `ACService`
3. `SkillService`, `PassiveCheckService`, `InitiativeService`
4. `CombatService`, `CombatStateService` (Death Saves, Temp HP, Instant Death)
5. `ConditionService` (15 conditions + exhaustion 6-level table)
6. `SpellSlotService`, `ConcentrationService`
7. `RestService` (Short + Long Rest with all class-specific resets)
8. `MulticlassService` (prerequisite tables + combined caster level)
9. `InventoryService`, `XPService`

### Phase 2.4: API Implementation
Build all endpoints from Section 5 on top of the validated services. Each controller must:
* Validate input shapes (DTO validation).
* Call the appropriate Service (never the Repository directly).
* Return the standard error JSON structure on failures.

### Phase 2.5: Validation Middleware
Implement reusable guards enforced across all relevant endpoints:
* **Point Buy Guard:** Validates 27-point budget with non-linear cost table (8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9). Rejects scores outside 8–15 range before racial bonuses.
* **Skill Selection Guard:** Rejects `CharacterSkill` entries not present in the 18-skill catalog (US-77.3).
* **Attunement Guard:** Rejects attunement beyond 3 items.
* **Concentration Guard:** Ensures only one concentration spell active (enforced at `POST /cast`).
* **Death State Guard:** Rejects HP-modifying actions (other than healing and damage) when `is_dead = true`.

### Phase 2.6: Multiclassing & Feats Validation
Implement the `MulticlassService` prerequisite table and wire it into the `POST /characters/:id/multiclass` controller. Validate Feat prerequisites in `POST /characters/:id/feats`. Confirm combined spell slot math with integration tests using representative multiclass character fixtures (e.g., Fighter 2 / Wizard 3 = caster level 3, Fighter 3 / Paladin 2 = caster level 4).

---

## 7. UI Creation Wizard Contract (PDF-Matched Flow)

The mobile-first character creation UI must follow the approved `docs/Create Character.pdf` information architecture while preserving the engine contract from Sections 3 and 5.

### 7.1 Screen Flow

The wizard is modeled as a UI flow, not as a backend transaction sequence. It presents these screens:

1. Datos generales
2. Selección de raza
3. Tu selección (raza)
4. Atributos del personaje
5. Trasfondo
6. Tu selección (trasfondo)
7. Rasgos de personalidad
8. Clase
9. Tu selección (clase)
10. Subclase, only when the selected class grants one at level 1 per US-96
11. Habilidades de clase
12. Trucos / Conjuros, only when applicable per class catalog counts
13. Cálculo de puntos de golpe

### 7.2 Ability Score Preview Architecture

The UI must keep two separate concepts visible and technically distinct:

- `base_score`: the Point Buy value edited by the player. It is constrained to 8–15 and counted against the 27-point budget.
- `preview_total_score`: the value shown as the primary score in the UI, calculated as `base_score + racial_bonus`.

Only `base_score` is sent in `ability_scores` to `POST /characters`. The persisted base value must not include racial bonuses. The hydrated character sheet later computes the official total using the engine rule from Section 3 Step 1:

`total_score = base_score + racial_bonus + asi_bonus + feat_bonus`

### 7.3 Required UI Reasoning

Each ability row in the creation wizard must display the exact reason for the shown total. Example for Dragonborn Strength:

`Base 8 + +2 raza = 10`

This keeps the UI aligned with the PDF while preventing accidental double-application of racial bonuses in the database.

### 7.4 Visual Token Contract

The mobile creation wizard must use visual tokens derived from `docs/Create Character.pdf` and the connected Figma source file `DM-Dnd-App--Copy-` (`kwyCppseLygq4bUhYdFD7j`, section `Create Character` / `2015:2689`):

- Page background: `#332115`.
- Cards and option surfaces: `#462f20`; active/selection surfaces and chips: `#64422b`.
- Decorative/tan border: `#92752b`; field/card outline where shown in Figma: `#bbbbbb`.
- Primary action: `#720000` red button with `#dbdbdb` label text.
- Text: `#ffd7ad` for screen headings and key names, `#c4c4c4` for secondary labels, `#dbdbdb` / white for body copy.
- Typography: `Prata` for wizard top titles, `Pragati Narrow` for section headings and buttons, `Roboto` for labels, cards, controls, and helper text.
- Progress indicator: exactly five 3px rounded bars with 8px gaps, using muted completed bars, cream active bar, and `#64422b` inactive bars.
- Attribute editor: six attributes remain in a 3-column by 2-row grid on mobile, each card showing final preview score plus explicit `Base + raza = total` reasoning.

These tokens apply to the creation flow first. Existing desktop/admin panels can continue using their current structure until redesigned, but mobile wizard screens must not regress to the previous black/blue dashboard palette.
