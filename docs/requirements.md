# Phase 1: Specify - `requirements.md`

## 1. Project Overview

This system is a character management logical engine based on the core rules of the Player's Handbook (SRD 5.1). Its objective is to automate the calculation of vital statistics and core mechanics, ensuring universal business rules are applied consistently without manual errors, while strictly separating data logic from the user interface.

## 2. Core Business Rules (Universal Logic)

- **Language Standard:**   Code (variables, logic, database) in **English**. User Interface and values in **Spanish**.
- **Mathematical Rounding:** All divisions or fractions MUST **round down** (floor) to the nearest whole integer, even if the decimal is .5 or higher.
- **Rule Precedence:** Specific traits always override general mechanics.
- **Modifier Formula:** `modifier = floor((ability_score - 10) / 2)`.
- **Proficiency Ceiling:** Proficiency bonus is added, multiplied, or halved only once per roll, regardless of multiple sources.
- **Advantage / Disadvantage:** Roll 2d20. Take the highest for Advantage, the lowest for Disadvantage. If both apply, they cancel out entirely, rolling only 1d20. Multiple instances of Advantage or Disadvantage do not stack.

## 3. Functional Requirements (FR)

**FR-01: Ability Modifier Calculation**
Derive modifiers from the 6 base ability scores (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma) using the standard formula.

**FR-02: Base Armor Class (AC)**
In the absence of armor/shield, calculate base AC as `10 + dexterity_modifier`.

**FR-03: Hit Points (HP) Generation**
Level 1 Max HP = `max_hit_die_value + constitution_modifier`. Minimum resulting value: 1.

**FR-04: Higher Level HP Scaling**
Upon leveling up, the system uses the fixed average value `(die_size / 2) + 1 + constitution_modifier` (equivalent to the PHB fixed value, which rounds the average up). Minimum HP gained per level: 1. The system must NOT store this value statically; it must be recalculated if the `constitution_modifier` changes retroactively.

**FR-05: Proficiency Bonus Scaling**
Scales by total character level: Levels 1-4 (+2), 5-8 (+3), 9-12 (+4), 13-16 (+5), 17-20 (+6).

**FR-06: Attribute Constraints**
Base scores cannot exceed 20 through standard level progression. Minimum base score is 1.

**FR-07: Carrying Capacity**
Calculate max carrying weight (in pounds) as `strength_score * 15`. Push/drag/lift limit is `strength_score * 30`; speed drops to 5 ft when exceeding carrying capacity.

**FR-08: Critical Hit Mechanics**
On a natural 20 attack roll, double the number of damage dice rolled before adding any flat ability modifiers. All extra damage dice from other sources (e.g., Sneak Attack, Savage Attacks) are also doubled.

**FR-09: Experience to Level Mapping**
The system must calculate `total_level` based on `experience_points` strictly following the standard progression: Lv 1 (0 XP), Lv 2 (300 XP), Lv 3 (900), Lv 4 (2,700), Lv 5 (6,500), Lv 6 (14,000), Lv 7 (23,000), Lv 8 (34,000), Lv 9 (48,000), Lv 10 (64,000), Lv 11 (85,000), Lv 12 (100,000), Lv 13 (120,000), Lv 14 (140,000), Lv 15 (165,000), Lv 16 (195,000), Lv 17 (225,000), Lv 18 (265,000), Lv 19 (305,000), Lv 20 (355,000).

**FR-10: Short Rest**
A short rest is a period of downtime lasting at least 1 hour, during which a character does nothing more strenuous than eating, drinking, reading, or tending to wounds. During a short rest, a character may spend one or more Hit Dice to recover HP (see US-71). A character can benefit from any number of short rests in a day.

**FR-11: Long Rest**
A long rest is a period of extended downtime lasting at least 8 hours, during which a character sleeps for at least 6 hours and performs no more than 2 hours of light activity. At the end of a long rest, a character: (a) recovers all lost HP; (b) recovers expended Hit Dice up to a number equal to half the character's total Hit Dice (minimum 1 die recovered). A character must have at least 1 HP at the start of the rest to gain its benefits. A character cannot benefit from more than one long rest in a 24-hour period.

**FR-12: Passive Ability Checks**
For checks that do not require a dice roll (used for detection and background awareness), the system calculates: `passive_score = 10 + total_ability_modifier`. If the character has Advantage on the check, add 5. If Disadvantage, subtract 5. The most commonly used passive check is Passive Perception: `10 + wisdom_modifier + (proficiency_bonus if proficient in Perception)`.

**FR-13: Initiative**
At the start of combat, each participant rolls a Dexterity check (`1d20 + dexterity_modifier`) to determine their place in the initiative order. The system must expose an `initiative_bonus` field calculated as `dexterity_modifier`. Ties are broken at the DM's discretion.


## 4. User Stories & Acceptance Criteria

### US-01: Base Ability Scores Management

**As a** player, **I want** to input my ability scores **so that** the system calculates my modifiers automatically.

- **AC 1.1:** The system must validate and store 6 integer values: `strength`, `dexterity`, `constitution`, `intelligence`, `wisdom`, `charisma`.
- **AC 1.2:** The system must support the Standard Array values {15, 14, 13, 12, 10, 8} and the Point Buy system (spending 27 points, base scores ranging from 8 to 15 per the cost table defined in US-88).
- **AC 1.3:** Modifiers must update dynamically if the base score changes.
- **AC 1.4:** **Mathematical Validation:** A score of 15 must result in a +2 modifier. A score of 9 must result in -1.

### US-02: Health and Stamina Setup

**As a** player, **I want** my health to be calculated automatically based on my level and hit die **so that** I know my physical resilience.

- **AC 2.1:** The system requires the definition of a `hit_die_type` (e.g., 6, 8, 10, 12).
- **AC 2.2:** At Level 1, Max HP is exactly `hit_die_type + constitution_modifier`.
- **AC 2.3:** **Guardrail:** If the `constitution_modifier` is negative and reduces the HP change to 0 or less, the minimum HP gained per level must be 1.

### US-03: Unarmored Defense (Base AC)

**As an** unarmored character, **I want** to view my base Armor Class **so that** I know my natural defense.

- **AC 3.1:** The system must detect if the `is_armored` state is false.
- **AC 3.2:** The projected formula must be `10 + dexterity_modifier`.
- **AC 3.3:** This value must be calculated at runtime via a pure service, not stored as a static integer.

### US-04: Proficiency Bonus Tracking

**As a** progressing character, **I want** my proficiency bonus to increase with my level **so that** it reflects my overall training.

- **AC 4.1:** The system must calculate the `total_level` by summing all class levels.
- **AC 4.2:** The bonus must strictly follow the progression table: Level 1-4 (+2), Level 5-8 (+3), Level 9-12 (+4), Level 13-16 (+5), Level 17-20 (+6).

### US-05: Carrying Capacity Tracking

**As an** adventurer, **I want** the system to calculate my maximum carrying capacity **so that** I know how much equipment I can hold.

- **AC 5.1:** The system must calculate carrying capacity as `strength * 15` in pounds.
- **AC 5.2:** Push, drag, or lift limits must be calculated as `strength * 30` in pounds. Speed drops to 5 ft when pushing/dragging weight above carrying capacity.

### US-06: Combat Dice Resolution (Criticals)

**As a** combatant, **I want** the system to resolve critical hits correctly **so that** I deal the appropriate amount of damage.

- **AC 6.1:** When an attack roll equals exactly 20 (on the die), the `is_critical` flag must be true.
- **AC 6.2:** If `is_critical` is true, the engine must multiply the quantity of damage dice by 2, roll them, and _then_ add the standard flat modifiers.

### US-07: Human Race Integration (Standard)

**As a** player, **I want** to select the Human race **so that** my character automatically receives the correct racial benefits and statistics.

- **AC 7.1:** When `race_id` is set to `human`, the system must automatically apply a `+1` modifier to all six base ability scores (`strength`, `dexterity`, `constitution`, `intelligence`, `wisdom`, `charisma`).
- **AC 7.2:** The `size` attribute must be rigidly set to `medium`.
- **AC 7.3:** The `base_speed` attribute must be set to `30`.
- **AC 7.4:** The system must automatically assign `common` to the `languages` array and prompt the user to select exactly one additional valid `language_id`.

### US-08: Variant Human Integration (Optional Rule)

**As a** player using optional rules, **I want** to select the Variant Human **so that** I can customize my character with a feat and specific skill.

- **AC 8.1:** When `race_id` is set to `human_variant`, the system must prompt the user to select exactly two _different_ ability scores to increase by `+1`. The system must reject any attempt to apply both points to the same ability score.
- **AC 8.2:** The system must prompt the user to select exactly one additional skill proficiency to add to their character's `skill_proficiencies` array.
- **AC 8.3:** The system must prompt the user to select exactly one valid `feat_id` to add to the character's abilities.
- **AC 8.4:** `size` and `base_speed` inherit the same restrictions as the Standard Human (AC 7.2 and AC 7.3).

### US-09: Dwarf Race Integration (Base Traits)

**As a** player, **I want** to select the Dwarf race **so that** my character automatically receives the correct base dwarven modifiers and proficiencies.

- **AC 9.1:** When `race_id` is set to any dwarf variant, the system must automatically apply a `+2` modifier to the base `constitution` score.
- **AC 9.2:** The `size` attribute must be rigidly set to `medium`.
- **AC 9.3:** The `base_speed` attribute must be set to `25`.
- **AC 9.4 (Specific Override):** If the character has a dwarf `race_id`, their `base_speed` MUST NOT be reduced by wearing heavy armor, circumventing the standard Strength requirement rules for heavy armor.
- **AC 9.5:** The system must automatically assign `common` and `dwarvish` to the `languages` array.
- **AC 9.6:** The system must automatically assign `battleaxe`, `handaxe`, `throwing_hammer`, and `warhammer` to the `weapon_proficiencies` array.
- **AC 9.7:** The system must prompt the user to select exactly one `tool_proficiency` from the following constrained list: `smiths_tools`, `brewers_supplies`, or `masons_tools`.
- **AC 9.8:** The system must assign `poison` to the character's `damage_resistances` array and apply advantage on saving throws against poison.

### US-10: Dwarf Subraces Integration

**As a** player, **I want** to select a specific Dwarf subrace **so that** the unique mechanical benefits of my subrace are calculated correctly.

- **AC 10.1 (Hill Dwarf):** If `race_id` is set to `dwarf_hill`, the system must apply an additional `+1` modifier to the base `wisdom` score.
- **AC 10.2 (Hill Dwarf HP Override):** If `race_id` is `dwarf_hill`, the system must automatically add exactly `1` additional Hit Point to the character's Max HP for every level in `total_level` (modifying the base HP calculations in FR-03 and FR-04).
- **AC 10.3 (Mountain Dwarf):** If `race_id` is set to `dwarf_mountain`, the system must apply an additional `+2` modifier to the base `strength` score.
- **AC 10.4 (Mountain Dwarf Armor):** If `race_id` is `dwarf_mountain`, the system must automatically assign `light_armor` and `medium_armor` to the `armor_proficiencies` array.

### US-11: Elf Race Integration (Base Traits)

**As a** player, **I want** to select the Elf race **so that** my character automatically receives the correct base elven modifiers, proficiencies, and sensory traits.

- **AC 11.1:** When `race_id` is set to any elf variant, the system must automatically apply a `+2` modifier to the base `dexterity` score.
- **AC 11.2:** The `size` attribute must be rigidly set to `medium`.
- **AC 11.3:** The default `base_speed` attribute must be set to `30`.
- **AC 11.4:** The `darkvision_radius` must be set to `60` feet.
- **AC 11.5:** The system must automatically assign `perception` to the `skill_proficiencies` array (Keen Senses).
- **AC 11.6:** The system must automatically assign `common` and `elvish` to the `languages` array.
- **AC 11.7:** The system must set boolean flags for `has_fey_ancestry` (advantage on saving throws against being charmed and immunity to magical sleep) and `has_trance` (long rest achieved in 4 hours).

### US-12: Elf Subraces Integration

**As a** player, **I want** to select a specific Elf subrace **so that** the unique mechanical benefits, weapons, and innate spells of my subrace are calculated correctly.

- **AC 12.1 (High Elf):** If `race_id` is set to `elf_high`, the system must apply an additional `+1` modifier to the base `intelligence` score.
- **AC 12.2 (High Elf Weapons):** If `race_id` is `elf_high`, the system must assign `longsword`, `shortsword`, `shortbow`, and `longbow` to the `weapon_proficiencies` array.
- **AC 12.3 (High Elf Magic):** The system must prompt the user to select exactly one `spell_id` tagged as a Wizard cantrip. This spell must use `intelligence` as its spellcasting ability.
- **AC 12.4 (High Elf Language):** The system must prompt the user to select exactly one additional valid `language_id`.

- **AC 12.5 (Wood Elf):** If `race_id` is set to `elf_wood`, the system must apply an additional `+1` modifier to the base `wisdom` score.
- **AC 12.6 (Wood Elf Weapons):** If `race_id` is `elf_wood`, the system must assign `longsword`, `shortsword`, `shortbow`, and `longbow` to the `weapon_proficiencies` array.
- **AC 12.7 (Wood Elf Speed):** If `race_id` is `elf_wood`, the system must override the `base_speed` attribute to `35`.
- **AC 12.8 (Wood Elf Stealth):** The system must set a boolean flag for `mask_of_the_wild` (ability to hide when lightly obscured by natural phenomena).

- **AC 12.9 (Drow):** If `race_id` is set to `elf_drow`, the system must apply an additional `+1` modifier to the base `charisma` score.
- **AC 12.10 (Drow Vision):** If `race_id` is `elf_drow`, the system must override the `darkvision_radius` to `120` feet and set a boolean flag for `sunlight_sensitivity` (disadvantage on attack rolls and sight-based Perception checks in direct sunlight).
- **AC 12.11 (Drow Weapons):** If `race_id` is `elf_drow`, the system must assign `rapier`, `shortsword`, and `hand_crossbow` to the `weapon_proficiencies` array.
- **AC 12.12 (Drow Magic):** The system must automatically add the `dancing_lights` cantrip. If `total_level` >= 3, add `faerie_fire` (1/day limit, requires Concentration). If `total_level` >= 5, add `darkness` (1/day limit, requires Concentration). All Drow magic must use `charisma` as the spellcasting ability.

### US-13: Halfling Race Integration (Base Traits)

**As a** player, **I want** to select the Halfling race **so that** my character automatically receives the correct base halfling modifiers, size, and racial traits.

- **AC 13.1:** When `race_id` is set to any halfling variant, the system must automatically apply a `+2` modifier to the base `dexterity` score.
- **AC 13.2:** The `size` attribute must be rigidly set to `small`.
- **AC 13.3:** The default `base_speed` attribute must be set to `25`.
- **AC 13.4:** The system must set a boolean flag for `lucky` (reroll a natural 1 on an attack roll, ability check, or saving throw, must use the new roll).
- **AC 13.5:** The system must set a boolean flag for `brave` (advantage on saving throws against being frightened).
- **AC 13.6:** The system must set a boolean flag for `halfling_nimbleness` (can move through the space of any creature that is of a size larger than yours).
- **AC 13.7:** The system must automatically assign `common` and `halfling` to the `languages` array.

### US-14: Halfling Subraces Integration

**As a** player, **I want** to select a specific Halfling subrace **so that** the unique mechanical benefits of my subrace are calculated correctly.

- **AC 14.1 (Lightfoot):** If `race_id` is set to `halfling_lightfoot`, the system must apply an additional `+1` modifier to the base `charisma` score.
- **AC 14.2 (Lightfoot Stealth):** If `race_id` is `halfling_lightfoot`, the system must set a boolean flag for `naturally_stealthy` (can attempt to hide even when obscured only by a creature that is at least one size larger).
- **AC 14.3 (Stout):** If `race_id` is set to `halfling_stout`, the system must apply an additional `+1` modifier to the base `constitution` score.
- **AC 14.4 (Stout Resilience):** If `race_id` is `halfling_stout`, the system must assign `poison` to the character's `damage_resistances` array and apply advantage on saving throws against poison.

### US-15: Dragonborn Race Integration (Base Traits)

**As a** player, **I want** to select the Dragonborn race **so that** my character automatically receives the correct base modifiers, size, and languages.

- **AC 15.1:** When `race_id` is set to `dragonborn`, the system must automatically apply a `+2` modifier to the base `strength` score and a `+1` modifier to the base `charisma` score.
- **AC 15.2:** The `size` attribute must be rigidly set to `medium`.
- **AC 15.3:** The default `base_speed` attribute must be set to `30`.
- **AC 15.4:** The system must automatically assign `common` and `draconic` to the `languages` array.

### US-16: Draconic Ancestry & Breath Weapon Integration

**As a** Dragonborn character, **I want** to select my draconic ancestry **so that** the system correctly assigns my elemental resistance and Breath Weapon parameters.

- **AC 16.1:** If `race_id` is `dragonborn`, the system must prompt the user to select exactly one `draconic_ancestry_id` from the following list: `black`, `blue`, `brass`, `bronze`, `copper`, `gold`, `green`, `red`, `silver`, `white`.
- **AC 16.2 (Damage Resistance):** The system must automatically append the correct damage type to the `damage_resistances` array based on the ancestry (e.g., `acid` for Black/Copper, `lightning` for Blue/Bronze, `fire` for Brass/Gold/Red, `poison` for Green, `cold` for Silver/White).
- **AC 16.3 (Breath Weapon DC):** The system must calculate and expose the Breath Weapon Saving Throw DC as `8 + constitution_modifier + proficiency_bonus`.
- **AC 16.4 (Breath Weapon Damage Scaling):** The system must calculate the Breath Weapon damage dice based on `total_level`: `2d6` for levels 1-5, `3d6` for levels 6-10, `4d6` for levels 11-15, and `5d6` for levels 16-20.
- **AC 16.5:** The system must track the Breath Weapon usage, limiting it to exactly `1` use, recoverable upon completing a short or long rest.


### US-17: Gnome Race Integration (Base Traits)

**As a** player, **I want** to select the Gnome race **so that** my character automatically receives the correct base modifiers, size, and gnome cunning traits.

- **AC 17.1:** When `race_id` is set to any gnome variant, the system must automatically apply a `+2` modifier to the base `intelligence` score.
- **AC 17.2:** The `size` attribute must be rigidly set to `small`.
- **AC 17.3:** The default `base_speed` attribute must be set to `25`.
- **AC 17.4:** The `darkvision_radius` must be set to `60` feet.
- **AC 17.5:** The system must set a boolean flag for `gnome_cunning` (advantage on all Intelligence, Wisdom, and Charisma saving throws against magic).
- **AC 17.6:** The system must automatically assign `common` and `gnomish` to the `languages` array.

### US-18: Gnome Subraces Integration

**As a** player, **I want** to select a specific Gnome subrace **so that** the unique mechanical benefits, proficiencies, and spells of my subrace are calculated correctly.

- **AC 18.1 (Forest Gnome):** If `race_id` is set to `gnome_forest`, the system must apply an additional `+1` modifier to the base `dexterity` score.
- **AC 18.2 (Forest Gnome Magic):** If `race_id` is `gnome_forest`, the system must automatically assign the `minor_illusion` cantrip to the character, strictly using `intelligence` as the spellcasting ability.
- **AC 18.3 (Forest Gnome Trait):** If `race_id` is `gnome_forest`, the system must set a boolean flag for `speak_with_small_beasts`.
- **AC 18.4 (Rock Gnome):** If `race_id` is set to `gnome_rock`, the system must apply an additional `+1` modifier to the base `constitution` score.
- **AC 18.5 (Rock Gnome Lore):** If `race_id` is `gnome_rock`, the system must set a boolean flag for `artificers_lore` (allows doubling the proficiency bonus on Intelligence/History checks related to magic items, alchemical objects, or technological devices).
- **AC 18.6 (Rock Gnome Tinker):** If `race_id` is `gnome_rock`, the system must automatically assign `tinkers_tools` to the `tool_proficiencies` array and set a boolean flag for the `tinker` crafting ability.

### US-19: Half-Elf Race Integration

**As a** player, **I want** to select the Half-Elf race **so that** my character receives the correct base modifiers, versatile skill choices, and sensory traits.

- **AC 19.1:** When `race_id` is set to `half_elf`, the system must automatically apply a `+2` modifier to the base `charisma` score.
- **AC 19.2 (Dynamic ASI):** The system must prompt the user to select exactly two _different_ ability scores (excluding `charisma`) to increase by `+1`. The system must reject any attempt to apply both points to the same ability score or to charisma.
- **AC 19.3:** The `size` attribute must be rigidly set to `medium` and the `base_speed` attribute must be set to `30`.
- **AC 19.4:** The `darkvision_radius` must be set to `60` feet.
- **AC 19.5:** The system must set a boolean flag for `has_fey_ancestry` (advantage on saving throws against being charmed and immunity to magical sleep).
- **AC 19.6 (Skill Versatility):** The system must prompt the user to select exactly two valid `skill_id`s to add to their `skill_proficiencies` array.
- **AC 19.7:** The system must automatically assign `common` and `elvish` to the `languages` array, and prompt the user to select exactly one additional valid `language_id`.

### US-20: Half-Orc Race Integration

**As a** player, **I want** to select the Half-Orc race **so that** my character automatically receives the correct base modifiers, proficiencies, and combat survival traits.

- **AC 20.1:** When `race_id` is set to `half_orc`, the system must automatically apply a `+2` modifier to the base `strength` score and a `+1` modifier to the base `constitution` score.
- **AC 20.2:** The `size` attribute must be rigidly set to `medium` and the default `base_speed` attribute must be set to `30`.
- **AC 20.3:** The `darkvision_radius` must be set to `60` feet.
- **AC 20.4 (Menacing):** The system must automatically assign `intimidation` to the `skill_proficiencies` array.
- **AC 20.5 (Relentless Endurance):** The system must set a boolean flag for `relentless_endurance`. If true, when the character's HP is reduced to 0 but not killed outright, the system must set HP to 1 instead. The system must track its usage, limiting it to exactly `1` use, recoverable upon completing a long rest.
- **AC 20.6 (Savage Attacks):** The system must set a boolean flag for `savage_attacks`. When `is_critical` is true on a melee weapon attack, the engine must roll one additional damage die of the weapon's type and add it to the total critical damage.
- **AC 20.7:** The system must automatically assign `common` and `orc` to the `languages` array.

### US-21: Tiefling Race Integration

**As a** player, **I want** to select the Tiefling race **so that** my character automatically receives the correct base modifiers, sensory traits, and innate infernal magic.

- **AC 21.1:** When `race_id` is set to `tiefling`, the system must automatically apply a `+1` modifier to the base `intelligence` score and a `+2` modifier to the base `charisma` score.
- **AC 21.2:** The `size` attribute must be rigidly set to `medium` and the default `base_speed` attribute must be set to `30`.
- **AC 21.3:** The `darkvision_radius` must be set to `60` feet.
- **AC 21.4 (Hellish Resistance):** The system must automatically assign `fire` to the `damage_resistances` array.
- **AC 21.5 (Infernal Legacy):** The system must automatically assign the `thaumaturgy` cantrip. If `total_level` >= 3, the system must add the `hellish_rebuke` spell (cast as a 2nd-level spell, limited to exactly 1 use per long rest). If `total_level` >= 5, the system must add the `darkness` spell (limited to exactly 1 use per long rest, requires Concentration). All spells granted by this trait must strictly use `charisma` as the spellcasting ability.
- **AC 21.6:** The system must automatically assign `common` and `infernal` to the `languages` array.

### US-22: Core Class Assignment & Progression

**As a** player, **I want** to assign a class to my character and increase its level **so that** the system automatically manages my Hit Dice, proficiencies, and level-based progression.

- **AC 22.1 (Class Tracking):** The system must track classes using an array of objects (e.g., `[{class_id: "fighter", level: 1}]`) to allow for future multiclassing support.
- **AC 22.2 (Total Level):** The engine must calculate the character's `total_level` as the sum of all individual class levels. The `total_level` must strictly be a value between `1` and `20`.
- **AC 22.3 (Base HP Generation):** At exactly `total_level = 1`, the system must assign the maximum value of the primary class's Hit Die plus the `constitution_modifier` to the character's Max HP.
- **AC 22.4 (Level Up HP Scaling):** For every class level gained after the 1st total level, the system must add `(hit_die_type / 2) + 1 + constitution_modifier` to the Max HP. Minimum HP gained per level must be 1.
- **AC 22.5 (Hit Dice Pool):** The system must allocate and track a pool of Hit Dice matching the quantity and types of dice derived from the character's class levels (e.g., a Level 3 Fighter must have a pool of exactly three `d10` Hit Dice).
- **AC 22.6 (Proficiency Aggregation):** The system must aggregate all weapon, armor, tool, saving throw, and skill proficiencies granted by the selected classes into their respective character arrays. The engine must ensure there are no duplicate entries in these arrays.

### US-23: Barbarian Class Integration (Base Traits & Level 1)

**As a** player, **I want** to select the Barbarian class **so that** my character automatically receives the correct Hit Dice, proficiencies, and level 1 class features.

- **AC 23.1 (Hit Dice & Base HP):** When the primary `class_id` is set to `barbarian`, the system must set the `hit_die_type` to `12`. At level 1, the Max HP calculation must strictly be `12 + constitution_modifier`.
- **AC 23.2 (Base Proficiencies):** The system must automatically assign `light_armor`, `medium_armor`, and `shields` to the `armor_proficiencies` array. It must assign `simple_weapons` and `martial_weapons` to the `weapon_proficiencies` array. It must assign `strength` and `constitution` to the `saving_throw_proficiencies` array.
- **AC 23.3 (Skill Selection):** The system must prompt the user to select exactly two `skill_id`s from the following constrained list: `athletics`, `intimidation`, `nature`, `perception`, `survival`, or `animal_handling`.
- **AC 23.4 (Unarmored Defense Override):** If the character has at least one level in `barbarian` and the `is_armored` state is false, the system must override the standard AC calculation (FR-02) and instead calculate base AC as `10 + dexterity_modifier + constitution_modifier`. This calculation remains valid if a shield is equipped.
- **AC 23.5 (Rage State):** The system must support a temporary combat state flag `is_raging`. When `is_raging` is true AND the character is not wearing heavy armor, the engine must automatically:
  - Apply advantage to all Strength ability checks and Strength saving throws.
  - Grant resistance to `bludgeoning`, `piercing`, and `slashing` damage types.
  - Add a flat `rage_damage` bonus (starting at `+2` for level 1) to damage rolls for melee weapon attacks that use Strength.

### US-24: Universal Level Advancement & Feature Unlocks

**As a** progressing character, **I want** the system to track my XP and automatically unlock class features and attribute increases **so that** my character scales accurately according to the rules.

- **AC 24.1:** The system must automatically update `total_level` when `experience_points` reach the thresholds defined in FR-09.
- **AC 24.2 (Class Progression Matrix):** The system must query a progression catalog for each assigned `class_id` to unlock specific features (e.g., Action Surge, Spellcasting) based on the character's `class_level`.
- **AC 24.3 (Ability Score Improvement - ASI):** When a class progression grants an ASI (typically at class levels 4, 8, 12, 16, and 19), the system must prompt the user to either increase one ability score by `+2`, two ability scores by `+1`, or select a valid `feat_id` (if optional feat rules are enabled).
- **AC 24.4:** The system must enforce the hard cap of `20` for any ability score increased via an ASI.

### US-25: Barbarian Class Progression (Levels 1-5 Scaling)

**As a** Barbarian, **I want** the system to unlock my specific class features as I level up **so that** my combat capabilities scale accurately.

- **AC 25.1 (Rage Scaling):** The system must dynamically calculate Max Rage uses and Rage Damage based on the Barbarian `class_level`:
  - Levels 1-2: 2 uses, +2 damage.
  - Levels 3-5: 3 uses, +2 damage.
- **AC 25.2 (Level 2 - Reckless Attack & Danger Sense):** If Barbarian `class_level` >= 2, the system must set boolean flags for `reckless_attack` (grants advantage on melee STR attacks, grants advantage to enemies attacking the character) and `danger_sense` (advantage on DEX saving throws against seen effects).
- **AC 25.3 (Level 3 - Primal Path):** If Barbarian `class_level` >= 3, the system must prompt the user to select exactly one `barbarian_path_id` (e.g., `path_of_the_berserker`, `path_of_the_totem_warrior`) to unlock subclass features.
- **AC 25.4 (Level 5 - Extra Attack & Fast Movement):** If Barbarian `class_level` >= 5, the system must set a boolean flag for `extra_attack` (allowing 2 attacks per Attack action) and automatically increase `base_speed` by `+10` feet (if not wearing heavy armor).

### US-26: Bard Class Integration (Base Traits & Level 1)

**As a** player, **I want** to select the Bard class **so that** my character automatically receives the correct Hit Dice, proficiencies, spellcasting abilities, and level 1 class features.

- **AC 26.1 (Hit Dice & Base HP):** When the primary `class_id` is set to `bard`, the system must set the `hit_die_type` to `8`. At level 1, the Max HP calculation must strictly be `8 + constitution_modifier`.
- **AC 26.2 (Base Proficiencies):** The system must automatically assign `light_armor` to the `armor_proficiencies` array. It must assign `simple_weapons`, `hand_crossbow`, `longsword`, `rapier`, and `shortsword` to the `weapon_proficiencies` array. It must assign `dexterity` and `charisma` to the `saving_throw_proficiencies` array.
- **AC 26.3 (Selections):** The system must prompt the user to select exactly three valid `skill_id`s and exactly three `tool_proficiency` IDs (restricted to musical instruments).
- **AC 26.4 (Spellcasting):** The system must set the `spellcasting_ability` to `charisma`. It must calculate Spell Save DC as `8 + proficiency_bonus + charisma_modifier` and Spell Attack Modifier as `proficiency_bonus + charisma_modifier`. The user must be prompted to select exactly two `spell_id`s (cantrips) and four `spell_id`s (1st-level) from the Bard spell list.
- **AC 26.5 (Bardic Inspiration):** The system must initialize a `bardic_inspiration` pool with a maximum capacity equal to `charisma_modifier` (minimum of 1). At level 1, the die size must be `d6`, and the pool must recover all uses upon completing a long rest.

### US-27: Bard Class Progression (Levels 1-5 Scaling)

**As a** Bard, **I want** the system to unlock my specific class features as I level up **so that** my support and skill capabilities scale accurately.

- **AC 27.1 (Level 2 - Jack of All Trades):** If Bard `class_level` >= 2, the system must set a boolean flag for `jack_of_all_trades`. When true, the engine must add `floor(proficiency_bonus / 2)` to any **ability check** that does not already include the full proficiency bonus. This bonus does NOT apply to attack rolls or saving throws.
- **AC 27.2 (Level 2 - Song of Rest):** If Bard `class_level` >= 2, the system must set a boolean flag for `song_of_rest`. When true, any friendly creature (including the Bard) regaining HP at the end of a short rest must receive an additional `1d6` healing.
- **AC 27.3 (Level 3 - Bard College):** If Bard `class_level` >= 3, the system must prompt the user to select exactly one `bard_college_id` (`college_of_lore` or `college_of_valor`) to unlock subclass features.
- **AC 27.4 (Level 3 - Expertise):** If Bard `class_level` >= 3, the system must prompt the user to select exactly two `skill_id`s from their existing `skill_proficiencies` array. The engine must multiply the proficiency bonus by 2 for checks using these specific skills.
- **AC 27.5 (Level 5 - Font of Inspiration):** If Bard `class_level` >= 5, the system must update the `bardic_inspiration` pool recovery condition to trigger on completing either a short rest or a long rest.
- **AC 27.6 (Level 5 - Inspiration Die Scaling):** If Bard `class_level` >= 5, the system must update the `bardic_inspiration` die size to `d8`.

### US-28: Warlock Class Integration (Base Traits & Level 1)

**As a** player, **I want** to select the Warlock class **so that** my character automatically receives the correct Hit Dice, proficiencies, Pact Magic, and Otherworldly Patron at level 1.

- **AC 28.1 (Hit Dice & Base HP):** When the primary `class_id` is set to `warlock`, the system must set the `hit_die_type` to `8`. At level 1, the Max HP calculation must strictly be `8 + constitution_modifier`.
- **AC 28.2 (Base Proficiencies):** The system must automatically assign `light_armor` to the `armor_proficiencies` array. It must assign `simple_weapons` to the `weapon_proficiencies` array. It must assign `wisdom` and `charisma` to the `saving_throw_proficiencies` array.
- **AC 28.3 (Skill Selection):** The system must prompt the user to select exactly two `skill_id`s from the following constrained list: `arcana`, `deception`, `history`, `intimidation`, `investigation`, `nature`, or `religion`.
- **AC 28.4 (Otherworldly Patron):** If Warlock `class_level` >= 1, the system must prompt the user to select exactly one `warlock_patron_id` (e.g., `archfey`, `fiend`, `great_old_one`) to unlock subclass features immediately at level 1.
- **AC 28.5 (Pact Magic - Base):** The system must set the `spellcasting_ability` to `charisma`. Spell Save DC is `8 + proficiency_bonus + charisma_modifier` and Spell Attack Modifier is `proficiency_bonus + charisma_modifier`. The user must be prompted to select exactly two `spell_id`s (cantrips) and two `spell_id`s (1st-level) from the Warlock spell list.
- **AC 28.6 (Pact Magic - Recovery):** Unlike standard spellcasting, the system must recover all expended Warlock spell slots upon completing either a short rest or a long rest.

### US-29: Warlock Class Progression (Levels 1-5 Scaling)

**As a** Warlock, **I want** the system to unlock my specific class features as I level up **so that** my eldritch invocations and pact boons scale accurately.

- **AC 29.1 (Pact Magic Scaling):** The system must dynamically scale the quantity and the level of the spell slots based on the Warlock `class_level` (e.g., Levels 2: 2 slots of 1st level; Levels 3-4: 2 slots of 2nd level; Level 5: 2 slots of 3rd level).
- **AC 29.2 (Level 2 - Eldritch Invocations):** If Warlock `class_level` >= 2, the system must prompt the user to select exactly two `invocation_id`s from the Eldritch Invocations catalog. The system must enforce any prerequisites tied to these invocations (e.g., specific level or pact boon requirements).
- **AC 29.3 (Level 3 - Pact Boon):** If Warlock `class_level` >= 3, the system must prompt the user to select exactly one `pact_boon_id` (`pact_of_the_chain`, `pact_of_the_blade`, or `pact_of_the_tome`) unlocking its specific mechanical benefits.

### US-30: Cleric Class Integration (Base Traits & Level 1)

**As a** player, **I want** to select the Cleric class **so that** my character automatically receives the correct Hit Dice, proficiencies, spellcasting abilities, and Divine Domain at level 1.

- **AC 30.1 (Hit Dice & Base HP):** When the primary `class_id` is set to `cleric`, the system must set the `hit_die_type` to `8`. At level 1, the Max HP calculation must strictly be `8 + constitution_modifier`.
- **AC 30.2 (Base Proficiencies):** The system must automatically assign `light_armor`, `medium_armor`, and `shields` to the `armor_proficiencies` array. It must assign `simple_weapons` to the `weapon_proficiencies` array. It must assign `wisdom` and `charisma` to the `saving_throw_proficiencies` array.
- **AC 30.3 (Skill Selection):** The system must prompt the user to select exactly two `skill_id`s from the following constrained list: `history`, `insight`, `medicine`, `persuasion`, or `religion`.
- **AC 30.4 (Spellcasting):** The system must set the `spellcasting_ability` to `wisdom`. It must calculate Spell Save DC as `8 + proficiency_bonus + wisdom_modifier` and Spell Attack Modifier as `proficiency_bonus + wisdom_modifier`. The user must be prompted to select exactly three `spell_id`s (cantrips) from the Cleric spell list.
- **AC 30.5 (Divine Domain):** If Cleric `class_level` >= 1, the system must prompt the user to select exactly one `cleric_domain_id` (e.g., `domain_knowledge`, `domain_life`, `domain_war`) to unlock subclass features immediately.

### US-31: Cleric Class Progression (Levels 1-5 Scaling)

**As a** Cleric, **I want** the system to unlock my specific class features as I level up **so that** my Channel Divinity and spell preparation scale accurately.

- **AC 31.1 (Spell Preparation):** The system must allow the user to prepare a number of spells equal to `cleric_class_level + wisdom_modifier` (minimum of 1). These spells must be of a level for which the character has spell slots.
- **AC 31.2 (Domain Spells):** The system must automatically append the specific spells granted by the selected `cleric_domain_id` to the character's prepared spells list. These domain spells must NOT count against the total preparation limit defined in AC 31.1.
- **AC 31.3 (Level 2 - Channel Divinity):** If Cleric `class_level` >= 2, the system must unlock the `channel_divinity` resource pool (1 use, recoverable on short or long rest). It must grant the `turn_undead` action and the specific Channel Divinity action associated with the chosen Divine Domain.
- **AC 31.4 (Level 5 - Destroy Undead):** If Cleric `class_level` >= 5, the system must set a boolean flag for `destroy_undead_cr_half`. When true, any undead of Challenge Rating 1/2 or lower that fails its saving throw against `turn_undead` is instantly destroyed instead of turned.

### US-32: Druid Class Integration (Base Traits & Level 1)

**As a** player, **I want** to select the Druid class **so that** my character automatically receives the correct Hit Dice, proficiencies, and Druidic language at level 1.

- **AC 32.1 (Hit Dice & Base HP):** When the primary `class_id` is set to `druid`, the system must set the `hit_die_type` to `8`. At level 1, the Max HP calculation must strictly be `8 + constitution_modifier`.
- **AC 32.2 (Base Proficiencies):** The system must automatically assign `light_armor`, `medium_armor`, and `shields` to the `armor_proficiencies` array. **Guardrail:** The system must set a flag `disallows_metal_armor` to true; the API must reject any attempt to equip metal armor on a Druid. It must assign `clubs`, `daggers`, `darts`, `javelins`, `maces`, `quarterstaffs`, `scimitars`, `sickles`, `slings`, and `spears` to the `weapon_proficiencies` array. It must assign `herbalism_kit` to the `tool_proficiencies` array.
- **AC 32.3 (Saving Throws & Skills):** The system must assign `intelligence` and `wisdom` to the `saving_throw_proficiencies` array. The user must be prompted to select exactly two `skill_id`s from: `arcana`, `animal_handling`, `insight`, `medicine`, `nature`, `perception`, `religion`, or `survival`.
- **AC 32.4 (Druidic):** The system must automatically assign `druidic` to the `languages` array. This language does not count against the limit of languages granted by race or background.
- **AC 32.5 (Spellcasting):** The system must set the `spellcasting_ability` to `wisdom`. It must calculate Spell Save DC as `8 + proficiency_bonus + wisdom_modifier` and Spell Attack Modifier as `proficiency_bonus + wisdom_modifier`. The user must be prompted to select exactly two `spell_id`s (cantrips) from the Druid spell list.

### US-33: Druid Class Progression (Levels 1-5 Scaling)

**As a** Druid, **I want** the system to manage my spell preparation and Wild Shape limitations accurately as I level up.

- **AC 33.1 (Spell Preparation):** The system must allow the user to prepare a number of spells equal to `druid_class_level + wisdom_modifier` (minimum of 1).
- **AC 33.2 (Level 2 - Wild Shape):** If Druid `class_level` >= 2, the system must initialize a `wild_shape_uses` pool with a maximum of `2`, recoverable upon completing a short or long rest.
- **AC 33.3 (Wild Shape Constraints):** The system must enforce transformation limits based on level:
  - **Level 2:** Max CR 1/4, no flying or swimming speed.
  - **Level 4:** Max CR 1/2, no flying speed (swimming allowed).
- **AC 33.4 (Level 2 - Druid Circle):** If Druid `class_level` >= 2, the system must prompt the user to select exactly one `druid_circle_id` (e.g., `circle_of_the_land`, `circle_of_the_moon`) to unlock subclass features.
- **AC 33.5 (Level 2 - Circle of the Moon Override):** If `druid_circle_id` is `circle_of_the_moon`, the system must override AC 33.3 to allow Max CR 1 at level 2 (Combat Wild Shape).


### US-34: Ranger Class Integration (Base Traits & Level 1)

**As a** player, **I want** to select the Ranger class **so that** my character automatically receives the correct Hit Dice, proficiencies, and wilderness exploration traits at level 1.

- **AC 34.1 (Hit Dice & Base HP):** When the primary `class_id` is set to `ranger`, the system must set the `hit_die_type` to `10`. At level 1, the Max HP calculation must strictly be `10 + constitution_modifier`.
- **AC 34.2 (Base Proficiencies):** The system must automatically assign `light_armor`, `medium_armor`, and `shields` to the `armor_proficiencies` array. It must assign `simple_weapons` and `martial_weapons` to the `weapon_proficiencies` array. It must assign `strength` and `dexterity` to the `saving_throw_proficiencies` array.
- **AC 34.3 (Skill Selection):** The system must prompt the user to select exactly three `skill_id`s from the following constrained list: `animal_handling`, `athletics`, `insight`, `investigation`, `nature`, `perception`, `stealth`, or `survival`.
- **AC 34.4 (Favored Enemy):** The system must prompt the user to select exactly one `favored_enemy_id` (e.g., `beasts`, `fey`, `humanoids`). The system must also prompt the user to select exactly one additional valid `language_id` associated with that enemy. The engine must set a flag to apply advantage on Wisdom (Survival) checks to track these enemies and Intelligence checks to recall information about them.
- **AC 34.5 (Natural Explorer):** The system must prompt the user to select exactly one `favored_terrain_id` (e.g., `forest`, `mountain`, `swamp`) to unlock specific exploration benefits.

### US-35: Ranger Class Progression (Levels 1-5 Scaling)

**As a** Ranger, **I want** the system to unlock my combat styles, spells, and archetype features as I level up.

- **AC 35.1 (Level 2 - Fighting Style):** If Ranger `class_level` >= 2, the system must prompt the user to select exactly one `fighting_style_id` from a constrained list: `archery` (+2 to ranged weapon attack rolls), `defense` (+1 to AC when wearing armor), `dueling` (+2 to melee damage when wielding one weapon and no other weapons), or `two_weapon_fighting` (add ability modifier to the second attack's damage).
- **AC 35.2 (Level 2 - Spellcasting):** If Ranger `class_level` >= 2, the system must enable spellcasting. The system must set the `spellcasting_ability` to `wisdom`. It must calculate Spell Save DC as `8 + proficiency_bonus + wisdom_modifier` and Spell Attack Modifier as `proficiency_bonus + wisdom_modifier`. The user must be prompted to select exactly two `spell_id`s (1st-level) from the Ranger spell list.
- **AC 35.3 (Level 3 - Ranger Archetype):** If Ranger `class_level` >= 3, the system must prompt the user to select exactly one `ranger_archetype_id` (`hunter` or `beast_master`) to unlock subclass features.
- **AC 35.4 (Level 3 - Primeval Awareness):** If Ranger `class_level` >= 3, the system must set a boolean flag `has_primeval_awareness`, allowing the expenditure of a spell slot to detect certain creature types within a 1-mile radius (or up to 6 miles in favored terrain).
- **AC 35.5 (Level 5 - Extra Attack):** If Ranger `class_level` >= 5, the system must set a boolean flag for `extra_attack` allowing 2 attacks per Attack action.

### US-36: Fighter Class Integration (Base Traits & Level 1)

**As a** player, **I want** to select the Fighter class **so that** my character automatically receives the correct Hit Dice, proficiencies, combat styles, and healing traits at level 1.

- **AC 36.1 (Hit Dice & Base HP):** When the primary `class_id` is set to `fighter`, the system must set the `hit_die_type` to `10`. At level 1, the Max HP calculation must strictly be `10 + constitution_modifier`.
- **AC 36.2 (Base Proficiencies):** The system must automatically assign `light_armor`, `medium_armor`, `heavy_armor`, and `shields` to the `armor_proficiencies` array. It must assign `simple_weapons` and `martial_weapons` to the `weapon_proficiencies` array. It must assign `strength` and `constitution` to the `saving_throw_proficiencies` array.
- **AC 36.3 (Skill Selection):** The system must prompt the user to select exactly two `skill_id`s from the following constrained list: `acrobatics`, `animal_handling`, `athletics`, `history`, `insight`, `intimidation`, `perception`, or `survival`.
- **AC 36.4 (Fighting Style):** The system must prompt the user to select exactly one `fighting_style_id` from a constrained list: `archery` (+2 to ranged weapon attack rolls), `defense` (+1 to AC when wearing armor), `dueling` (+2 to melee damage when wielding one weapon and no other weapons), `great_weapon_fighting` (reroll 1s and 2s on damage dice with two-handed melee weapons), `protection` (use reaction to impose disadvantage on an attack against an ally within 5ft if wielding a shield), or `two_weapon_fighting` (add ability modifier to the second attack's damage).
- **AC 36.5 (Second Wind):** The system must initialize a `second_wind_uses` pool with a maximum capacity of `1`, recoverable upon completing a short or long rest. The engine must calculate the healing output as `1d10 + fighter_class_level`.

### US-37: Fighter Class Progression (Levels 1-5 Scaling)

**As a** Fighter, **I want** the system to unlock my action surges, martial archetypes, and multiple attacks as I level up.

- **AC 37.1 (Level 2 - Action Surge):** If Fighter `class_level` >= 2, the system must initialize an `action_surge_uses` pool with a maximum capacity of `1`, recoverable upon completing a short or long rest. This feature grants one additional action on the character's turn.
- **AC 37.2 (Level 3 - Martial Archetype):** If Fighter `class_level` >= 3, the system must prompt the user to select exactly one `martial_archetype_id` (e.g., `champion`, `battle_master`, `eldritch_knight`) to unlock subclass features.
- **AC 37.3 (Level 3 - Champion Improved Critical):** If `martial_archetype_id` is `champion`, the system must update the critical hit mechanic (FR-08) to trigger on a natural roll of `19` or `20` on the d20.
- **AC 37.4 (Level 5 - Extra Attack):** If Fighter `class_level` >= 5, the system must set a boolean flag for `extra_attack` allowing exactly 2 attacks per Attack action.

### US-38: Sorcerer Class Integration (Base Traits & Level 1)

**As a** player, **I want** to select the Sorcerer class **so that** my character automatically receives the correct Hit Dice, proficiencies, spellcasting, and Sorcerous Origin at level 1.

- **AC 38.1 (Hit Dice & Base HP):** When the primary `class_id` is set to `sorcerer`, the system must set the `hit_die_type` to `6`. At level 1, the Max HP calculation must strictly be `6 + constitution_modifier`.
- **AC 38.2 (Base Proficiencies):** The system must assign an empty array to `armor_proficiencies` (no armor proficiencies). It must assign `daggers`, `darts`, `slings`, `quarterstaffs`, and `light_crossbows` to the `weapon_proficiencies` array. It must assign `constitution` and `charisma` to the `saving_throw_proficiencies` array.
- **AC 38.3 (Skill Selection):** The system must prompt the user to select exactly two `skill_id`s from the following constrained list: `arcana`, `deception`, `insight`, `intimidation`, `persuasion`, or `religion`.
- **AC 38.4 (Spellcasting):** The system must set the `spellcasting_ability` to `charisma`. It must calculate Spell Save DC as `8 + proficiency_bonus + charisma_modifier` and Spell Attack Modifier as `proficiency_bonus + charisma_modifier`. The user must be prompted to select exactly four `spell_id`s (cantrips) and two `spell_id`s (1st-level) from the Sorcerer spell list.
- **AC 38.5 (Sorcerous Origin):** If Sorcerer `class_level` >= 1, the system must prompt the user to select exactly one `sorcerous_origin_id` (e.g., `draconic_bloodline`, `wild_magic`) to unlock subclass features immediately.
- **AC 38.6 (Draconic Resilience Overrides):** If `sorcerous_origin_id` is `draconic_bloodline`, the system must automatically add exactly `1` additional Hit Point to the character's Max HP for every level in `total_level`. Additionally, if the `is_armored` state is false, the system must override the standard AC calculation (FR-02) and instead calculate base AC as `13 + dexterity_modifier`.

### US-39: Sorcerer Class Progression (Levels 1-5 Scaling)

**As a** Sorcerer, **I want** the system to manage my Sorcery Points and Metamagic options as I level up.

- **AC 39.1 (Level 2 - Font of Magic):** If Sorcerer `class_level` >= 2, the system must initialize a `sorcery_points` pool with a maximum capacity exactly equal to the `sorcerer_class_level`. This pool must recover all uses strictly upon completing a long rest.
- **AC 39.2 (Level 2 - Flexible Casting):** The system must allow the conversion logic between `sorcery_points` and spell slots based on the standard exchange rate table (e.g., a 1st-level slot costs 2 points, a 2nd-level slot costs 3 points).
- **AC 39.3 (Level 3 - Metamagic Selection):** If Sorcerer `class_level` >= 3, the system must prompt the user to select exactly two `metamagic_id`s from the constrained catalog (e.g., `careful_spell`, `quickened_spell`, `twinned_spell`). The system must validate that the user has enough `sorcery_points` when attempting to apply a chosen Metamagic effect to a spell at runtime.

### US-40: Wizard Class Integration (Base Traits & Level 1)

**As a** player, **I want** to select the Wizard class **so that** my character automatically receives the correct Hit Dice, proficiencies, spellbook, and Arcane Recovery feature at level 1.

- **AC 40.1 (Hit Dice & Base HP):** When the primary `class_id` is set to `wizard`, the system must set the `hit_die_type` to `6`. At level 1, the Max HP calculation must strictly be `6 + constitution_modifier`.
- **AC 40.2 (Base Proficiencies):** The system must assign an empty array to `armor_proficiencies` (no armor proficiencies). It must assign `daggers`, `darts`, `slings`, `quarterstaffs`, and `light_crossbows` to the `weapon_proficiencies` array. It must assign `intelligence` and `wisdom` to the `saving_throw_proficiencies` array.
- **AC 40.3 (Skill Selection):** The system must prompt the user to select exactly two `skill_id`s from the following constrained list: `arcana`, `history`, `insight`, `investigation`, `medicine`, or `religion`.
- **AC 40.4 (Spellcasting Base):** The system must set the `spellcasting_ability` to `intelligence`. It must calculate Spell Save DC as `8 + proficiency_bonus + intelligence_modifier` and Spell Attack Modifier as `proficiency_bonus + intelligence_modifier`. The user must be prompted to select exactly three `spell_id`s (cantrips) from the Wizard spell list.
- **AC 40.5 (Spellbook Initialization):** The system must initialize a `known_spells` array representing the character's spellbook. At level 1, the system must prompt the user to select exactly six `spell_id`s (1st-level) from the Wizard spell list to populate this array.
- **AC 40.6 (Arcane Recovery):** The system must track the Arcane Recovery feature. Once per day after completing a short rest, the user can recover expended spell slots with a combined level equal to or less than `ceil(wizard_class_level / 2)`.

### US-41: Wizard Class Progression (Levels 1-5 Scaling)

**As a** Wizard, **I want** the system to manage my spell preparation, spellbook expansion, and Arcane Traditions as I level up.

- **AC 41.1 (Spell Preparation):** The system must allow the user to prepare a number of spells equal to `wizard_class_level + intelligence_modifier` (minimum of 1). The user may ONLY select spells that are currently in their `known_spells` (spellbook) array.
- **AC 41.2 (Spellbook Expansion):** Upon gaining any Wizard `class_level` beyond level 1, the system must prompt the user to select exactly two new `spell_id`s from the Wizard spell list to add to their `known_spells` array. The selected spells must be of a level for which the character has spell slots.
- **AC 41.3 (Level 2 - Arcane Tradition):** If Wizard `class_level` >= 2, the system must prompt the user to select exactly one `arcane_tradition_id` (e.g., `school_of_evocation`, `school_of_abjuration`) to unlock subclass features.
- **AC 41.4 (Level 2 - Subclass Savant Overrides):** The system must reduce the gold and time costs required to copy spells of the chosen school into the spellbook by half, if crafting/copying mechanics are later implemented.

### US-42: Monk Class Integration (Base Traits & Level 1)

**As a** player, **I want** to select the Monk class **so that** my character automatically receives the correct Hit Dice, proficiencies, Unarmored Defense, and Martial Arts traits at level 1.

- **AC 42.1 (Hit Dice & Base HP):** When the primary `class_id` is set to `monk`, the system must set the `hit_die_type` to `8`. At level 1, the Max HP calculation must strictly be `8 + constitution_modifier`.
- **AC 42.2 (Base Proficiencies):** The system must assign an empty array to `armor_proficiencies` (no armor or shield proficiencies). It must assign `simple_weapons` and `shortsword` to the `weapon_proficiencies` array. It must assign `strength` and `dexterity` to the `saving_throw_proficiencies` array. The user must be prompted to select exactly one `tool_proficiency` from artisan's tools or musical instruments.
- **AC 42.3 (Skill Selection):** The system must prompt the user to select exactly two `skill_id`s from the following constrained list: `acrobatics`, `athletics`, `history`, `insight`, `religion`, or `stealth`.
- **AC 42.4 (Unarmored Defense Override):** If the character has at least one level in `monk` and is neither wearing armor nor wielding a shield, the system must override the standard AC calculation (FR-02) and instead calculate base AC as `10 + dexterity_modifier + wisdom_modifier`.
- **AC 42.5 (Martial Arts):** The system must set a boolean flag for `martial_arts` valid only when unarmored and without a shield. When true, the engine must allow the use of `dexterity_modifier` instead of `strength_modifier` for attack and damage rolls of unarmed strikes and monk weapons. The system must set the base unarmed strike damage die to `1d4`.

### US-43: Monk Class Progression (Levels 1-5 Scaling)

**As a** Monk, **I want** the system to unlock my Ki, unarmored movement, and Monastic Tradition as I level up.

- **AC 43.1 (Level 2 - Ki Pool):** If Monk `class_level` >= 2, the system must initialize a `ki_points` pool with a maximum capacity exactly equal to the `monk_class_level`. This pool must recover all uses upon completing a short or long rest. The system must calculate the Ki Save DC as `8 + proficiency_bonus + wisdom_modifier`.
- **AC 43.2 (Level 2 - Unarmored Movement):** If Monk `class_level` >= 2, and the character is unarmored and not wielding a shield, the system must automatically increase the `base_speed` by `+10` feet.
- **AC 43.3 (Level 3 - Monastic Tradition):** If Monk `class_level` >= 3, the system must prompt the user to select exactly one `monastic_tradition_id` (e.g., `way_of_the_open_hand`, `way_of_shadow`) to unlock subclass features.
- **AC 43.4 (Level 3 - Deflect Missiles):** If Monk `class_level` >= 3, the system must set a flag for `deflect_missiles`, allowing the user to spend a reaction to reduce ranged weapon damage by `1d10 + dexterity_modifier + monk_class_level`.
- **AC 43.5 (Level 5 - Extra Attack & Stunning Strike):** If Monk `class_level` >= 5, the system must set a boolean flag for `extra_attack` allowing exactly 2 attacks per Attack action. It must also unlock the `stunning_strike` feature (costing 1 Ki point upon a successful melee hit).
- **AC 43.6 (Level 5 - Martial Arts Scaling):** If Monk `class_level` >= 5, the system must scale the Martial Arts unarmed damage die from `1d4` to `1d6`.

### US-44: Paladin Class Integration (Base Traits & Level 1)

**As a** player, **I want** to select the Paladin class **so that** my character automatically receives the correct Hit Dice, proficiencies, and divine abilities at level 1.

- **AC 44.1 (Hit Dice & Base HP):** When the primary `class_id` is set to `paladin`, the system must set the `hit_die_type` to `10`. At level 1, the Max HP calculation must strictly be `10 + constitution_modifier`.
- **AC 44.2 (Base Proficiencies):** The system must automatically assign `light_armor`, `medium_armor`, `heavy_armor`, and `shields` to the `armor_proficiencies` array. It must assign `simple_weapons` and `martial_weapons` to the `weapon_proficiencies` array. It must assign `wisdom` and `charisma` to the `saving_throw_proficiencies` array.
- **AC 44.3 (Skill Selection):** The system must prompt the user to select exactly two `skill_id`s from the following constrained list: `athletics`, `insight`, `intimidation`, `medicine`, `persuasion`, or `religion`.
- **AC 44.4 (Divine Sense):** The system must initialize a `divine_sense_uses` pool with a maximum capacity equal to `1 + charisma_modifier` (minimum of 1). This pool must recover all uses upon completing a long rest.
- **AC 44.5 (Lay on Hands):** The system must initialize a `lay_on_hands_pool` calculated strictly as `paladin_class_level * 5`. The system must allow the user to subtract any integer up to the current pool value to heal a creature or cure a disease/poison (costing 5 points per condition). The pool recovers fully upon completing a long rest.

### US-45: Paladin Class Progression (Levels 1-5 Scaling)

**As a** Paladin, **I want** the system to unlock my fighting style, spellcasting, and Sacred Oath features as I level up.

- **AC 45.1 (Level 2 - Fighting Style):** If Paladin `class_level` >= 2, the system must prompt the user to select exactly one `fighting_style_id` from a constrained list: `defense`, `dueling`, `great_weapon_fighting`, or `protection`.
- **AC 45.2 (Level 2 - Spellcasting):** If Paladin `class_level` >= 2, the system must enable spellcasting. The `spellcasting_ability` must be `charisma`. It must calculate Spell Save DC as `8 + proficiency_bonus + charisma_modifier` and Spell Attack Modifier as `proficiency_bonus + charisma_modifier`. The system must allow the user to prepare a number of spells equal to `floor(paladin_class_level / 2) + charisma_modifier` (minimum of 1).
- **AC 45.3 (Level 2 - Divine Smite):** If Paladin `class_level` >= 2, the system must allow the expenditure of a spell slot on a successful melee weapon hit. The engine must calculate the radiant damage added as `(slot_level + 1)d8`, capped at a maximum of `5d8`. If the target is strictly classified as an `undead` or `fiend`, the engine must add an additional `1d8` to the total.
- **AC 45.4 (Level 3 - Sacred Oath):** If Paladin `class_level` >= 3, the system must prompt the user to select exactly one `sacred_oath_id` (e.g., `oath_of_devotion`, `oath_of_the_ancients`) to unlock subclass features, including specific Channel Divinity options and automatically prepared Oath spells.
- **AC 45.5 (Level 3 - Divine Health):** If Paladin `class_level` >= 3, the system must set a boolean flag `immune_to_disease` to true.
- **AC 45.6 (Level 5 - Extra Attack):** If Paladin `class_level` >= 5, the system must set a boolean flag for `extra_attack` allowing exactly 2 attacks per Attack action.

### US-46: Rogue Class Integration (Base Traits & Level 1)

**As a** player, **I want** to select the Rogue class **so that** my character automatically receives the correct Hit Dice, proficiencies, Expertise, and Sneak Attack trait at level 1.

- **AC 46.1 (Hit Dice & Base HP):** When the primary `class_id` is set to `rogue`, the system must set the `hit_die_type` to `8`. At level 1, the Max HP calculation must strictly be `8 + constitution_modifier`.
- **AC 46.2 (Base Proficiencies):** The system must automatically assign `light_armor` to the `armor_proficiencies` array. It must assign `simple_weapons`, `hand_crossbow`, `longsword`, `rapier`, and `shortsword` to the `weapon_proficiencies` array. It must assign `thieves_tools` to the `tool_proficiencies` array. It must assign `dexterity` and `intelligence` to the `saving_throw_proficiencies` array.
- **AC 46.3 (Skill Selection):** The system must prompt the user to select exactly four `skill_id`s from the following constrained list: `acrobatics`, `athletics`, `deception`, `insight`, `intimidation`, `investigation`, `perception`, `performance`, `persuasion`, `sleight_of_hand`, or `stealth`.
- **AC 46.4 (Expertise):** The system must prompt the user to select exactly two proficiencies from their currently acquired `skill_proficiencies` or `thieves_tools`. The engine must multiply the proficiency bonus by 2 for checks using these specific selections.
- **AC 46.5 (Sneak Attack Base):** The system must enable a `sneak_attack` damage modifier. The engine must validate that the attack is made with a `finesse` or `ranged` weapon. If valid, and the attacker has advantage on the roll OR an active enemy of the target is within 5 feet (and the attacker lacks disadvantage), the engine must add exactly `1d6` to the damage calculation. This can trigger only once per turn.
- **AC 46.6 (Thieves' Cant):** The system must automatically assign `thieves_cant` to the `languages` array.

### US-47: Rogue Class Progression (Levels 1-5 Scaling)

**As a** Rogue, **I want** the system to unlock my Cunning Action, Roguish Archetype, and scale my Sneak Attack damage as I level up.

- **AC 47.1 (Sneak Attack Scaling):** The system must dynamically scale the Sneak Attack damage dice based on the Rogue `class_level`:
  - Levels 1-2: `1d6`
  - Levels 3-4: `2d6`
  - Level 5: `3d6`
- **AC 47.2 (Level 2 - Cunning Action):** If Rogue `class_level` >= 2, the system must set a boolean flag for `cunning_action`, allowing the character to take a Bonus Action on each of their turns in combat strictly to take the Dash, Disengage, or Hide actions.
- **AC 47.3 (Level 3 - Roguish Archetype):** If Rogue `class_level` >= 3, the system must prompt the user to select exactly one `roguish_archetype_id` (e.g., `thief`, `assassin`, `arcane_trickster`) to unlock subclass features.
- **AC 47.4 (Level 5 - Uncanny Dodge):** If Rogue `class_level` >= 5, the system must set a boolean flag for `uncanny_dodge`, allowing the character to use their reaction to halve the damage of an attack from an attacker they can see that hits them.


### US-48: Core Background Integration & Conflict Resolution

**As a** player, **I want** to select a background for my character **so that** the system automatically grants me the associated skills, tools, languages, and roleplaying characteristics.

- **AC 48.1 (Background Assignment):** The system must prompt the user to select exactly one `background_id` from the backgrounds catalog.
- **AC 48.2 (Duplicate Proficiency Guardrail):** The engine must check the character's existing `skill_proficiencies` and `tool_proficiencies` arrays before applying the background's proficiencies. If the background grants a proficiency the character already has, the system must prompt the user to select _any_ other valid proficiency of the same type (skill or tool) to replace it.
- **AC 48.3 (Characteristics Validation):** The system must allow the user to store text strings for `personality_traits`, `ideals`, `bonds`, and `flaws`.
- **AC 48.4 (Background Feature):** The system must assign a specific non-combat utility feature (string or boolean flag) based on the selected `background_id`.

### US-49: Acolyte Background

**As a** player, **I want** to select the Acolyte background **so that** my character receives religious training traits.

- **AC 49.1:** When `background_id` is set to `acolyte`, the system must automatically assign `insight` and `religion` to the `skill_proficiencies` array (subject to AC 48.2).
- **AC 49.2:** The system must prompt the user to select exactly two additional valid `language_id`s to add to the `languages` array.
- **AC 49.3:** The system must set a boolean flag for the `shelter_of_the_faithful` feature.

### US-50: Charlatan Background

**As a** player, **I want** to select the Charlatan background **so that** my character receives deception and infiltration traits.

- **AC 50.1:** When `background_id` is set to `charlatan`, the system must automatically assign `deception` and `sleight_of_hand` to the `skill_proficiencies` array (subject to AC 48.2).
- **AC 50.2:** The system must automatically assign `disguise_kit` and `forgery_kit` to the `tool_proficiencies` array.
- **AC 50.3:** The system must set a boolean flag for the `false_identity` feature.

### US-51: Criminal Background & Spy Variant

**As a** player, **I want** to select the Criminal background or its Spy variant **so that** my character receives underworld survival traits.

- **AC 51.1:** When `background_id` is set to `criminal` or `spy`, the system must automatically assign `deception` and `stealth` to the `skill_proficiencies` array (subject to AC 48.2).
- **AC 51.2:** The system must automatically assign `thieves_tools` to the `tool_proficiencies` array. The system must prompt the user to select exactly one additional `tool_proficiency` restricted to the `gaming_sets` category.
- **AC 51.3 (Criminal):** If `background_id` is `criminal`, the system sets the `criminal_contact` feature.
- **AC 51.4 (Spy):** If `background_id` is `spy`, the system sets the `spy_contact` feature (mechanically identical to criminal_contact).

### US-52: Entertainer Background & Gladiator Variant

**As a** player, **I want** to select the Entertainer background or its Gladiator variant **so that** my character receives performance and public appeal traits.

- **AC 52.1:** When `background_id` is set to `entertainer` or `gladiator`, the system must automatically assign `acrobatics` and `performance` to the `skill_proficiencies` array (subject to AC 48.2).
- **AC 52.2:** The system must automatically assign `disguise_kit` to the `tool_proficiencies` array and prompt the user to select exactly one `tool_proficiency` from the `musical_instruments` category.
- **AC 52.3 (Gladiator):** If `background_id` is `gladiator`, the system must replace the `musical_instruments` prompt with a prompt to select exactly one `unusual_weapon` as a performance prop (e.g., net, trident).
- **AC 52.4:** The system must set a boolean flag for the `by_popular_demand` feature.

### US-53: Folk Hero Background

**As a** player, **I want** to select the Folk Hero background **so that** my character receives commoner support traits.

- **AC 53.1:** When `background_id` is set to `folk_hero`, the system must automatically assign `animal_handling` and `survival` to the `skill_proficiencies` array (subject to AC 48.2).
- **AC 53.2:** The system must automatically assign `vehicles_land` to the `tool_proficiencies` array. The system must prompt the user to select exactly one additional `tool_proficiency` restricted to the `artisans_tools` category.
- **AC 53.3:** The system must set a boolean flag for the `rustic_hospitality` feature.

### US-54: Guild Artisan Background & Guild Merchant Variant

**As a** player, **I want** to select the Guild Artisan background or its Guild Merchant variant **so that** my character receives trade-related traits.

- **AC 54.1:** When `background_id` is set to `guild_artisan` or `guild_merchant`, the system must automatically assign `insight` and `persuasion` to the `skill_proficiencies` array (subject to AC 48.2).
- **AC 54.2 (Guild Artisan):** If `background_id` is `guild_artisan`, the system must prompt the user to select exactly one `tool_proficiency` from the `artisans_tools` category.
- **AC 54.3 (Guild Merchant):** If `background_id` is `guild_merchant`, the system must automatically assign `navigator_tools` or `vehicles_water` (user choice) instead of the artisan tools.
- **AC 54.4:** The system must prompt the user to select exactly one additional valid `language_id`.
- **AC 54.5:** The system must set a boolean flag for the `guild_membership` feature.

### US-55: Hermit Background

**As a** player, **I want** to select the Hermit background **so that** my character receives seclusion and hidden knowledge traits.

- **AC 55.1:** When `background_id` is set to `hermit`, the system must automatically assign `medicine` and `religion` to the `skill_proficiencies` array (subject to AC 48.2).
- **AC 55.2:** The system must automatically assign `herbalism_kit` to the `tool_proficiencies` array.
- **AC 55.3:** The system must prompt the user to select exactly one additional valid `language_id`.
- **AC 55.4:** The system must set a boolean flag for the `discovery` feature.

### US-56: Noble Background & Knight Variant

**As a** player, **I want** to select the Noble background or its Knight variant **so that** my character receives high-society traits.

- **AC 56.1:** When `background_id` is set to `noble` or `knight`, the system must automatically assign `history` and `persuasion` to the `skill_proficiencies` array (subject to AC 48.2).
- **AC 56.2:** The system must prompt the user to select exactly one `tool_proficiency` from the `gaming_sets` category and exactly one additional valid `language_id`.
- **AC 56.3 (Noble):** If `background_id` is `noble`, the system sets the `position_of_privilege` feature.
- **AC 56.4 (Knight):** If `background_id` is `knight`, the system sets the `retainers` feature.

### US-57: Outlander Background

**As a** player, **I want** to select the Outlander background **so that** my character receives wilderness survival and navigation traits.

- **AC 57.1:** When `background_id` is set to `outlander`, the system must automatically assign `athletics` and `survival` to the `skill_proficiencies` array (subject to AC 48.2).
- **AC 57.2:** The system must prompt the user to select exactly one `tool_proficiency` from the `musical_instruments` category and exactly one additional valid `language_id`.
- **AC 57.3:** The system must set a boolean flag for the `wanderer` feature.

### US-58: Sage Background

**As a** player, **I want** to select the Sage background **so that** my character receives academic and research traits.

- **AC 58.1:** When `background_id` is set to `sage`, the system must automatically assign `arcana` and `history` to the `skill_proficiencies` array (subject to AC 48.2).
- **AC 58.2:** The system must prompt the user to select exactly two additional valid `language_id`s to add to the `languages` array.
- **AC 58.3:** The system must set a boolean flag for the `researcher` feature.

### US-59: Sailor Background & Pirate Variant

**As a** player, **I want** to select the Sailor background or its Pirate variant **so that** my character receives seafaring traits.

- **AC 59.1:** When `background_id` is set to `sailor` or `pirate`, the system must automatically assign `athletics` and `perception` to the `skill_proficiencies` array (subject to AC 48.2).
- **AC 59.2:** The system must automatically assign `navigator_tools` and `vehicles_water` to the `tool_proficiencies` array.
- **AC 59.3 (Sailor):** If `background_id` is `sailor`, the system sets the `ships_passage` feature.
- **AC 59.4 (Pirate):** If `background_id` is `pirate`, the system sets the `bad_reputation` feature.

### US-60: Soldier Background

**As a** player, **I want** to select the Soldier background **so that** my character receives military training traits.

- **AC 60.1:** When `background_id` is set to `soldier`, the system must automatically assign `athletics` and `intimidation` to the `skill_proficiencies` array (subject to AC 48.2).
- **AC 60.2:** The system must automatically assign `vehicles_land` to the `tool_proficiencies` array. The system must prompt the user to select exactly one additional `tool_proficiency` restricted to the `gaming_sets` category.
- **AC 60.3:** The system must set a boolean flag for the `military_rank` feature.

### US-61: Urchin Background

**As a** player, **I want** to select the Urchin background **so that** my character receives city survival and stealth traits.

- **AC 61.1:** When `background_id` is set to `urchin`, the system must automatically assign `sleight_of_hand` and `stealth` to the `skill_proficiencies` array (subject to AC 48.2).
- **AC 61.2:** The system must automatically assign `disguise_kit` and `thieves_tools` to the `tool_proficiencies` array.
- **AC 61.3:** The system must set a boolean flag for the `city_secrets` feature.

### US-62: Starting Equipment Selection Logic

**As a** player creating a level 1 character, **I want** to choose between standard starting equipment or starting wealth **so that** my initial inventory is correctly initialized.

- **AC 62.1 (The "Either/Or" Rule):** The system must force a choice: Either the character receives the combined equipment from Class (US-63) and Background (US-64), OR they receive Starting Wealth (US-65). They cannot have both.
- **AC 62.2 (Inventory Initialization):** The system must initialize an `inventory` array to store item objects, including `item_id`, `quantity`, `weight_per_unit`, and `is_equipped`.
- **AC 62.3 (Currency Tracking):** The system must track currency in five denominations: `cp` (copper), `sp` (silver), `ep` (electrum), `gp` (gold), and `pp` (platinum). 100 cp = 10 sp = 2 ep = 1 gp; 10 gp = 1 pp.

### US-63: Class-Based Starting Equipment (Choice Management)

**As a** player, **I want** the system to guide me through the equipment choices granted by my class **so that** I don't miss any required gear.

- **AC 63.1 (Choice Resolution):** For classes that offer choices (e.g., Fighter: "_(a) chain mail or (b) leather armor, longbow, and 20 arrows_"), the system must prompt the user and only add the selected items to the `inventory`.
- **AC 63.2 (Default Weapons):** The system must automatically mark weapons and armor obtained through this process as `is_equipped: true` if the character has the required proficiencies.
- **AC 63.3 (Ammunition Link):** When adding a ranged weapon that requires ammunition (like a bow or crossbow), the system must automatically add the corresponding ammunition item with its correct quantity.

### US-64: Background-Based Starting Equipment

**As a** player, **I want** the system to automatically add the fixed items and gold from my background **so that** my inventory is complete.

- **AC 64.1 (Fixed Items):** Upon selecting a `background_id`, the system must append all associated items to the `inventory` (e.g., Acolyte: _a holy symbol, a prayer book, 5 sticks of incense_).
- **AC 64.2 (Starting Gold):** The system must add the flat gold amount defined by the background (e.g., Soldier: _10 gp_) to the character's `gp` balance.

### US-65: Starting Wealth (Alternative Logic)

**As a** player opting for starting wealth, **I want** the system to roll or assign the correct amount of gold based on my class **so that** I can buy my own gear.

- **AC 65.1 (Class-Wealth Mapping):** If the user chooses Starting Wealth, the system must calculate the gold based on the class formula (e.g., Fighter: `5d4 * 10 gp`, Monk: `5d4 gp`).
- **AC 65.2 (Empty Inventory):** Choosing this option must result in an empty `inventory` array (except for the calculated gold), effectively bypassing Class and Background equipment traits.

### US-66: Real-time Weight & Encumbrance Integration

**As an** adventurer, **I want** the system to calculate the total weight of my inventory **so that** I know if I am encumbered according to FR-07.

- **AC 66.1 (Total Weight Calculation):** The system must calculate `total_carried_weight` as the sum of `(item.weight * item.quantity)` for all items in the inventory.
- **AC 66.2 (Currency Weight):** By standard rule (optional but meticulous), every 50 coins of any type count as 1 pound. The system must include this in the `total_carried_weight`.
- **AC 66.3 (State Update):** If `total_carried_weight` > `carrying_capacity` (FR-07), the system must set a boolean flag `is_encumbered` to true and apply the corresponding speed penalties.

### US-67: Armor & Shield Catalog Logic

**As a** player equipping armor, **I want** the system to read the armor's properties **so that** my AC, speed, and stealth are calculated correctly.

- **AC 67.1 (Armor Categories):** The system must categorize armor items into `light`, `medium`, `heavy`, and `shield`.
- **AC 67.2 (AC Calculation Override):** When armor `is_equipped` is true, the system must override FR-02:
  - `light`: Base AC + full `dexterity_modifier`.
  - `medium`: Base AC + `dexterity_modifier` (maximum +2).
  - `heavy`: Base AC (ignores `dexterity_modifier` entirely).
  - `shield`: Adds a flat +2 to the final AC calculation.
- **AC 67.3 (Strength Requirements):** If the equipped armor has a `strength_requirement` property greater than the character's `strength` score, the system must reduce the character's `base_speed` by 10 feet (unless bypassed by US-09 Dwarf traits).
- **AC 67.4 (Stealth Disadvantage):** If the equipped armor has the `stealth_disadvantage` property set to true, the system must flag all Stealth skill checks to roll with disadvantage.

### US-68: Weapon Catalog & Properties Logic

**As a** combatant equipping a weapon, **I want** the system to apply the weapon's specific properties **so that** my attack and damage rolls follow the rules.

- **AC 68.1 (Weapon Categories):** The system must categorize weapon items as `simple_melee`, `simple_ranged`, `martial_melee`, or `martial_ranged`.
- **AC 68.2 (Base Properties):** The system must map the item's `damage_dice` (e.g., 1d8) and `damage_type` (e.g., piercing, slashing, bludgeoning) to the character's combat output.
- **AC 68.3 (Finesse):** If the weapon has the `finesse` property, the system must use the higher of `strength_modifier` or `dexterity_modifier` for both attack and damage rolls.
- **AC 68.4 (Heavy & Two-Handed):** If the weapon has the `heavy` property and the character's `size` is `small`, the system must apply disadvantage to attack rolls. If it has the `two_handed` property, the engine must prevent the equipping of a `shield` or a second weapon.
- **AC 68.5 (Light):** If the weapon has the `light` property, the system must flag it as eligible for two-weapon fighting rules.
- **AC 68.6 (Thrown & Range):** If the weapon has the `thrown` or `range` property, the system must expose its `range_normal` and `range_long` values (e.g., 20/60).
- **AC 68.7 (Versatile):** If the weapon has the `versatile` property (e.g., 1d10), the system must allow the user to toggle a two-handed grip state to use the higher damage die instead of the standard die (e.g., 1d8).

### US-69: Adventuring Gear, Packs & Tools Catalog

**As an** adventurer managing my pack, **I want** equipment bundles to expand automatically **so that** I don't have to manually input standard starting kits.

- **AC 69.1 (Equipment Packs Unpacking):** When a generic item representing an equipment pack (e.g., `explorers_pack`, `dungeoneers_pack`) is added to the inventory, the system must immediately delete the pack item itself and add its constituent items and quantities to the `inventory` array (e.g., a backpack, a bedroll, a mess kit, a tinderbox, 10 torches, 10 days of rations, and a waterskin).
- **AC 69.2 (Ammunition & Consumables):** Items tagged as `ammunition` or `consumable` must expose a decrement function to easily reduce `quantity` by 1 during gameplay.


---

## 5. New User Stories — Missing Mechanics (US-70 to US-88)

### US-70: Death Saving Throws

**As a** player whose character has reached 0 HP, **I want** the system to manage Death Saving Throws **so that** my character can stabilize or die following the official rules.

- **AC 70.1 (Trigger):** When `current_hp` reaches 0, the character enters the `unconscious` state and the Death Save mode is activated.
- **AC 70.2 (Roll):** On each of the character's turns while at 0 HP, the player rolls a d20 (no modifiers) to attempt a Death Saving Throw. The result is stored in `death_saves_success` (range 0–3) or `death_saves_fail` (range 0–3).
- **AC 70.3 (Stability):** If `death_saves_success` reaches 3, the character is considered **stable** (remains at 0 HP but is no longer in active danger; does not regain consciousness without healing).
- **AC 70.4 (Death):** If `death_saves_fail` reaches 3, the character **dies permanently** and their state is updated to `is_dead = true`.
- **AC 70.5 (Natural 20):** If the d20 roll result is 20, the character **regains 1 HP**, exits the unconscious state, and both `death_saves_success` and `death_saves_fail` are reset to 0.
- **AC 70.6 (Natural 1):** If the d20 roll result is 1, it counts as **2 failures** (incrementing `death_saves_fail` by 2).
- **AC 70.7 (Reset on Healing):** If the character receives any healing (HP > 0), both counters reset to 0 and Death Save mode deactivates.
- **AC 70.8 (Taking Damage at 0 HP):** If a character at 0 HP takes damage, it counts as 1 failed Death Saving Throw. If the damage is from a critical hit, it counts as 2 failures.

---

### US-71: Spending Hit Dice During Short Rest

**As a** player taking a Short Rest, **I want** to spend Hit Dice to recover HP **so that** my character can recuperate between encounters.

- **AC 71.1 (Short Rest Duration):** A Short Rest is a period of downtime lasting at least 1 hour. The system must expose a `triggerShortRest()` function.
- **AC 71.2 (Spending Hit Dice):** During a Short Rest, a player may spend one or more Hit Dice. For each die spent, the player rolls the die (based on class `hit_die`, e.g., 1d10 for Fighter) and adds their `constitution_modifier`. The result is added to `current_hp` (capped at `max_hp`).
- **AC 71.3 (Hit Dice Pool):** `HitDiceTracker.expended_dice` increments by 1 for each die spent. The system must enforce that `expended_dice` cannot exceed `max_dice`.
- **AC 71.4 (Long Rest Recovery):** Upon completing a Long Rest, the character recovers `floor(total_character_level / 2)` Hit Dice (minimum 1), decrementing `expended_dice` accordingly.
- **AC 71.5 (Class Bonuses During Short Rest):** Classes with features that activate on a Short Rest (e.g., Bard's Song of Rest, Warlock's Spell Slots) must trigger their effects when `triggerShortRest()` is called. Song of Rest adds bonus HP when spending Hit Dice (the die size scales with Bard level).

---

### US-72: Instant Death (Massive Damage)

**As a** player taking massive damage, **I want** the system to apply the Instant Death rule **so that** especially large hits can kill my character outright.

- **AC 72.1 (Trigger Condition):** When a single source of damage reduces the character to 0 HP and the **remaining damage** (damage beyond 0 HP) is **equal to or greater than the character's maximum HP**, the character dies instantly.
- **AC 72.2 (Instant Death Outcome):** The system must set `is_dead = true` directly, bypassing Death Saving Throws entirely. The Death Save counters are not incremented.
- **AC 72.3 (Formula):** `if (damage_taken >= current_hp + max_hp) → instant_death = true`.

---

### US-73: Temporary Hit Points

**As a** player that received Temporary HP from a spell or ability, **I want** the system to track and apply Temporary HP correctly **so that** they are consumed before my regular HP.

- **AC 73.1 (Damage Buffer):** When the character takes damage, the system must first subtract from `temp_hp`. Only damage exceeding the remaining `temp_hp` is applied to `current_hp`.
- **AC 73.2 (No Stacking):** Temporary HP from multiple sources **do not stack**. If a new source would grant more temporary HP than the current value, the player may choose to replace `temp_hp` with the new value. The lower value is always discarded.
- **AC 73.3 (Expiration):** Temporary HP do not recover on a Short or Long Rest unless the granting feature specifies otherwise.
- **AC 73.4 (Zero HP & Temp HP):** If `current_hp` is 0 but `temp_hp` is greater than 0, the character is **not** unconscious. Death Save mode is not activated until `temp_hp` is also depleted.

---

### US-74: Opportunity Attacks

**As a** combatant, **I want** the system to flag when an Opportunity Attack can be triggered **so that** I can react to enemies leaving my reach.

- **AC 74.1 (Trigger Condition):** An Opportunity Attack is triggered when a hostile creature within the character's melee reach moves out of that reach without using the Disengage action.
- **AC 74.2 (Reaction Cost):** An Opportunity Attack costs the character's **Reaction** for that turn. The system must track `reaction_available` (boolean, reset at the start of each turn) and set it to `false` when an Opportunity Attack is executed.
- **AC 74.3 (Disengage Bypass):** If the moving creature used the Disengage action on their turn, no Opportunity Attack can be triggered against them.
- **AC 74.4 (Attack Roll):** The Opportunity Attack uses the same attack bonus as a standard melee attack for that weapon (`proficiency_bonus + str_modifier` or `dex_modifier` if `finesse`).

---

### US-75: Unarmed Strike

**As a** character without a weapon, **I want** the system to calculate my unarmed strike damage **so that** I can still deal damage in combat.

- **AC 75.1 (Base Unarmed Strike):** An unarmed strike deals `1 + strength_modifier` bludgeoning damage (minimum 1). This applies to all characters by default.
- **AC 75.2 (Proficiency):** All characters are considered proficient with unarmed strikes. The attack roll bonus is `proficiency_bonus + strength_modifier`.
- **AC 75.3 (Monk Override):** For characters with the Monk class, the `MartialArts` trait overrides this formula. The Monk uses the `martial_arts_die` (d4 at levels 1-4, scaling upward) and may use `dexterity_modifier` instead of `strength_modifier` for both attack and damage rolls (see US-28 Martial Arts).
- **AC 75.4 (Natural Weapons):** Racial traits that grant a natural weapon (e.g., Lizardfolk claws, Tabaxi claws) are treated as unarmed strikes with a modified damage die and type as specified by the trait.

---

### US-76: Passive Ability Checks

**As a** Game Master using the system, **I want** the application to calculate and display each character's Passive scores **so that** I can make hidden checks without asking the player to roll.

- **AC 76.1 (Passive Perception):** `passive_perception = 10 + perception_bonus`. If the character has Advantage on Perception checks, add +5. If Disadvantage, subtract -5.
- **AC 76.2 (Passive Investigation):** `passive_investigation = 10 + investigation_bonus`.
- **AC 76.3 (Passive Insight):** `passive_insight = 10 + insight_bonus`.
- **AC 76.4 (Proficiency Inclusion):** The `_bonus` for each passive score must include the proficiency bonus if the character is proficient in that skill, and double the proficiency bonus if the character has Expertise in that skill.
- **AC 76.5 (Jack of All Trades):** For Bards, if the character is NOT proficient in the relevant skill, the `half_proficiency_bonus` (floor) must still be included in the passive score calculation.

---

### US-77: Skills Catalog & Ability Associations

**As a** player selecting skill proficiencies, **I want** the system to enforce the official 18-skill catalog with correct ability associations **so that** my skill bonuses are calculated accurately.

- **AC 77.1 (Complete Catalog):** The system must contain exactly the following 18 skills mapped to their governing ability scores:

| Skill | Ability |
|---|---|
| `acrobatics` | Dexterity |
| `animal_handling` | Wisdom |
| `arcana` | Intelligence |
| `athletics` | Strength |
| `deception` | Charisma |
| `history` | Intelligence |
| `insight` | Wisdom |
| `intimidation` | Charisma |
| `investigation` | Intelligence |
| `medicine` | Wisdom |
| `nature` | Intelligence |
| `perception` | Wisdom |
| `performance` | Charisma |
| `persuasion` | Charisma |
| `religion` | Intelligence |
| `sleight_of_hand` | Dexterity |
| `stealth` | Dexterity |
| `survival` | Wisdom |

- **AC 77.2 (Skill Bonus Formula):** `skill_bonus = ability_modifier + (is_proficient ? proficiency_bonus : 0) + (is_expertise ? proficiency_bonus : 0)`.
- **AC 77.3 (Validation):** The system must reject any `CharacterSkill` record whose `skill_id` is not in the catalog above.

---

### US-78: Concentration Mechanic

**As a** spellcaster maintaining a concentration spell, **I want** the system to enforce Concentration rules **so that** I cannot maintain two concentration spells simultaneously and must make saves when damaged.

- **AC 78.1 (One At A Time):** A character may only have one `concentration` spell active at any time. If the character casts a new concentration spell, the previous one ends immediately and its effects are removed.
- **AC 78.2 (Concentration Tracking):** The system must track `active_concentration_spell_id` (nullable foreign key to `KnownSpell`). When a concentration spell is cast, this field is set. When concentration ends for any reason, it is set to `null`.
- **AC 78.3 (Damage CON Save):** When a concentrating character takes damage, the system must prompt a Constitution Saving Throw. The DC is `max(10, floor(damage_taken / 2))`. If the character fails, `active_concentration_spell_id` is set to `null`.
- **AC 78.4 (CON Save Bonus):** The save roll uses `constitution_modifier + proficiency_bonus` (if the character is proficient in Constitution saves) vs. the DC.
- **AC 78.5 (Automatic End Conditions):** Concentration also ends if: (a) the character is incapacitated or killed, (b) the character casts another concentration spell, or (c) the player voluntarily ends it (no action required).
- **AC 78.6 (Spell Tagging):** Each `Spell` record in the catalog must include a boolean `requires_concentration` field. The system must use this field to trigger AC 78.1 and 78.3.

---

### US-79: Spell Slot Progression Tables

**As a** spellcaster leveling up, **I want** the system to automatically set my spell slot counts per level **so that** my available slots always match the official progression.

- **AC 79.1 (Full Casters — Levels 1–5):** The system must seed or derive the following slot tables for Bard, Cleric, Druid, Sorcerer, and Wizard:

| Level | 1st | 2nd | 3rd |
|---|---|---|---|
| 1 | 2 | — | — |
| 2 | 3 | — | — |
| 3 | 4 | 2 | — |
| 4 | 4 | 3 | — |
| 5 | 4 | 3 | 2 |

- **AC 79.2 (Half Casters — Paladin & Ranger):** Spell slots begin at level 2. The system must apply the half-caster progression table, where total slot counts are derived from `floor(class_level / 2)` mapped to the full-caster table.
- **AC 79.3 (Warlock — Pact Magic):** Warlock uses an independent `pact_magic` slot system. Slots are **always at the highest available level** (levels 1–2: 1st level; levels 3–4: 2nd level; level 5: 3rd level). All slots recover on a Short Rest instead of a Long Rest.
- **AC 79.4 (SpellSlotTracker Sync):** When a character gains a level in a spellcasting class, the `SpellSlotTracker` table must be updated to match the new slot counts. `max_slots` is updated; `expended_slots` is not altered (slots are not recovered on leveling up).
- **AC 79.5 (Slot Expenditure):** When a spell is cast, `expended_slots` for that `slot_level` increments by 1. The system must reject a cast if `expended_slots >= max_slots` for the chosen slot level.
- **AC 79.6 (Long Rest Recovery):** On a Long Rest, all `expended_slots` for all slot levels are reset to 0. For Warlocks, all Pact Magic slots recover on a Short Rest instead.

---

### US-80: Conditions Catalog

**As a** character affected by a condition, **I want** the system to apply the mechanical effects of each condition **so that** all rules are enforced automatically.

- **AC 80.1 (Conditions List):** The system must implement the following conditions with their exact mechanical effects:

| Condition | Key Effects |
|---|---|
| `blinded` | Auto-fail checks requiring sight; attack rolls against the target have Advantage; target's attacks have Disadvantage. |
| `charmed` | Cannot attack or target the charmer with harmful abilities or spells; the charmer has Advantage on social checks against the charmed creature. |
| `deafened` | Auto-fail any check requiring hearing. |
| `exhaustion` | See US-81 for the leveled exhaustion rules. |
| `frightened` | Disadvantage on ability checks and attack rolls while the source of fear is in sight; cannot willingly move closer to the source. |
| `grappled` | Speed becomes 0 and cannot be increased; ends if the grappler is incapacitated or if the target is moved out of reach. |
| `incapacitated` | Cannot take Actions or Reactions. |
| `invisible` | Impossible to see without special sense; treated as heavily obscured; Advantage on attack rolls; Disadvantage on attacks against it. |
| `paralyzed` | Incapacitated; auto-fail STR and DEX saves; attacks against it have Advantage; any hit within 5 ft. is a critical hit. |
| `petrified` | Transformed to stone; incapacitated, speed 0, unaware of surroundings; Advantage on attacks against it; auto-fail STR and DEX saves; Resistance to all damage; immune to poison and disease. |
| `poisoned` | Disadvantage on attack rolls and ability checks. |
| `prone` | Can only crawl (movement costs double); Disadvantage on attack rolls; attacks within 5 ft. have Advantage; ranged attacks beyond 5 ft. have Disadvantage. |
| `restrained` | Speed 0; Disadvantage on attack rolls; attacks against the target have Advantage; Disadvantage on DEX saves. |
| `stunned` | Incapacitated; can't move; can only speak falteringly; auto-fail STR and DEX saves; attacks against it have Advantage. |
| `unconscious` | Incapacitated; can't move or speak; unaware of surroundings; drops everything held; falls prone; auto-fail STR and DEX saves; attacks have Advantage; any hit within 5 ft. is a critical hit. |

- **AC 80.2 (ActiveState Integration):** Each condition must be stored as a boolean flag in `ActiveState` using the keys in the table above. The engine must check these flags when calculating attack rolls, saving throws, speed, and AC.
- **AC 80.3 (Stacking):** Multiple different conditions can apply simultaneously and stack their effects. The same condition from different sources does not apply twice.

---

### US-81: Exhaustion Levels

**As a** player tracking exhaustion, **I want** the system to apply cumulative exhaustion penalties **so that** my character suffers the correct debuffs at each level.

- **AC 81.1 (Exhaustion Levels):** The system must track `exhaustion_level` (integer, range 0–6) in `ActiveState`. The effects are cumulative:

| Level | Effect |
|---|---|
| 1 | Disadvantage on ability checks. |
| 2 | Speed halved. |
| 3 | Disadvantage on attack rolls and saving throws. |
| 4 | HP maximum halved. |
| 5 | Speed reduced to 0. |
| 6 | Death. |

- **AC 81.2 (Cumulative Application):** A character at level 3 suffers all effects from levels 1, 2, and 3 simultaneously.
- **AC 81.3 (HP Max Halved):** At exhaustion level 4, the `max_hp` calculation must be halved (floor). If `current_hp` exceeds the new `max_hp`, it must be reduced to match.
- **AC 81.4 (Death at Level 6):** When `exhaustion_level` reaches 6, the character dies. The system must set `is_dead = true`.
- **AC 81.5 (Recovery):** A Long Rest reduces `exhaustion_level` by 1, provided the character has sufficient food and water. The level cannot go below 0.

---

### US-82: Multiclassing Requirements & Rules

**As a** player wanting to multiclass, **I want** the system to validate the prerequisites and apply the correct rules **so that** only legal multiclass combinations are permitted.

- **AC 82.1 (Ability Score Prerequisites):** Before allowing a new class to be added via `CharacterClass`, the system must verify the character meets both the current class's **exit** requirement AND the new class's **entry** requirement. The prerequisites are:

| Class | Minimum Ability Score Required |
|---|---|
| Barbarian | STR 13 |
| Bard | CHA 13 |
| Cleric | WIS 13 |
| Druid | WIS 13 |
| Fighter | STR 13 or DEX 13 |
| Monk | DEX 13 and WIS 13 |
| Paladin | STR 13 and CHA 13 |
| Ranger | DEX 13 and WIS 13 |
| Rogue | DEX 13 |
| Sorcerer | CHA 13 |
| Warlock | CHA 13 |
| Wizard | INT 13 |

- **AC 82.2 (Hit Points on Multiclass):** When gaining a level in a new class (not the primary), HP increases by the new class's `hit_die / 2 + 1 + CON modifier` (floor). The first level of a new multiclass does NOT grant maximum hit die — it uses the average.
- **AC 82.3 (Proficiencies on Multiclass):** A character does not gain all starting proficiencies from a new class. They gain only the **multiclassing proficiencies** listed for that class (a subset defined per class in the catalog, e.g., Fighters gain light armor, medium armor, shields, simple weapons, and martial weapons when multiclassing in).
- **AC 82.4 (Spell Slots — Combined Caster Level):** For multiclassed spellcasters, the total spell slot count is determined by summing a "caster level" calculated as: full caster classes contribute their full level; half-caster classes (Paladin, Ranger) contribute floor(level/2); Warlock Pact Magic slots remain separate and are not combined. The combined caster level is then looked up in the full caster progression table (AC 79.1).
- **AC 82.5 (Proficiency Bonus):** Proficiency bonus is always based on **total character level** (sum of all class levels), never on any single class level.

---

### US-83: Feats Data Structure

**As a** player choosing a Feat instead of an ASI, **I want** the system to support Feats as an alternative to Ability Score Improvements **so that** my character can gain special abilities.

- **AC 83.1 (ASI vs. Feat Choice):** At levels where a class grants an Ability Score Improvement (US-51), the player must be able to choose between taking the standard +2/+1/+1 ASI or selecting one Feat. The system must represent this as a mutually exclusive choice.
- **AC 83.2 (Feat Prerequisites):** Each `Feat` record must include an optional `prerequisite` field (e.g., minimum ability score, race, proficiency). The system must validate the character meets all prerequisites before allowing the feat to be assigned.
- **AC 83.3 (Feat Effects as Traits):** Feat mechanical effects (e.g., ability score increase, new proficiency, new action) must be stored as structured data in the `Feat` table (similar to `Trait`) and processed by the engine during hydration.
- **AC 83.4 (No Duplicate Feats):** A character cannot take the same feat more than once unless the feat description explicitly states it can be taken multiple times.

---

### US-84: Languages Catalog

**As a** character with linguistic abilities, **I want** the system to track the languages I know **so that** communication rules can be applied.

- **AC 84.1 (Standard Languages):** The system must include a catalog of standard languages: `common`, `dwarvish`, `elvish`, `giant`, `gnomish`, `goblin`, `halfling`, `orc`.
- **AC 84.2 (Exotic Languages):** The system must also include exotic languages: `abyssal`, `celestial`, `draconic`, `deep_speech`, `infernal`, `primordial`, `sylvan`, `undercommon`.
- **AC 84.3 (Character Languages Table):** A `CharacterLanguage` junction table must link `character_id` to `language_id`.
- **AC 84.4 (Racial & Background Grants):** Race and Background selection must automatically populate the character's `CharacterLanguage` records per the rules:
  - All characters know `common`.
  - Races grant additional languages as defined in their data (e.g., Elves know `elvish`, Dwarves know `dwarvish`, Half-Elves choose 1 extra language).
  - Backgrounds grant additional languages where specified (e.g., Sage gains 2 languages of the player's choice).
- **AC 84.5 (Extra Language Choices):** When a race or background grants a "choose N languages," the system must prompt the player to select from the catalog and validate their choices are not duplicates of already-known languages.

---

### US-85: Point Buy Cost Table

**As a** player using the Point Buy method to assign ability scores, **I want** the system to enforce the official non-linear cost table **so that** the 27-point budget is spent correctly.

- **AC 85.1 (Cost Table):** The system must use the following official Point Buy cost table. The API must reject any attempt to set a base ability score outside the 8–15 range during Point Buy:

| Score | Point Cost |
|---|---|
| 8 | 0 |
| 9 | 1 |
| 10 | 2 |
| 11 | 3 |
| 12 | 4 |
| 13 | 5 |
| 14 | 7 |
| 15 | 9 |

- **AC 85.2 (Budget):** The total sum of all six ability score costs must not exceed **27 points**.
- **AC 85.3 (Minimum Score):** No ability score may be set below 8 via Point Buy.
- **AC 85.4 (Maximum Score Before Racial Bonus):** No ability score may be set above 15 via Point Buy. Racial bonuses (applied after Point Buy is finalized) can raise a score above 15.
- **AC 85.5 (Score Floor at 1):** After applying all bonuses (racial, ASI, feats), no ability score may be reduced below 1 by any means.

---

### US-86: Long Rest Rules

**As a** player completing a Long Rest, **I want** the system to apply all Long Rest benefits automatically **so that** my character's resources reset correctly.

- **AC 86.1 (Duration & Frequency):** A Long Rest is a period of at least 8 hours. A character may only benefit from one Long Rest per 24-hour period.
- **AC 86.2 (HP Recovery):** Upon completing a Long Rest, `current_hp` is restored to `max_hp` (taking into account any exhaustion-related `max_hp` reduction).
- **AC 86.3 (Hit Dice Recovery):** The character recovers `floor(total_character_level / 2)` expended Hit Dice (minimum 1). `HitDiceTracker.expended_dice` is decremented accordingly (cannot go below 0).
- **AC 86.4 (Spell Slot Recovery):** All `expended_slots` are reset to 0 for full and half casters. Warlock Pact Magic slots recover on Short Rest (see US-79.6).
- **AC 86.5 (Exhaustion Reduction):** `exhaustion_level` decreases by 1 (see US-81.5).
- **AC 86.6 (Class Resource Resets):** Class-specific resources that reset on a Long Rest must also reset:
  - Barbarian: `rage_count` reset to max rages per level.
  - Fighter: `action_surge` and `second_wind` usage counters reset.
  - Paladin: `lay_on_hands_pool` reset to max.
  - Wizard: `arcane_recovery` reset.

---

### US-87: Initiative & Turn Order

**As a** player entering combat, **I want** the system to calculate initiative scores **so that** turn order can be determined.

- **AC 87.1 (Initiative Roll):** Initiative is a **Dexterity check**: `d20 + dexterity_modifier`.
- **AC 87.2 (Jack of All Trades — Bard):** Bards add `floor(proficiency_bonus / 2)` to their Initiative roll if they are not already proficient in Initiative (Bards are not proficient in Initiative by default, so this always applies from level 2 onwards per US-27.4).
- **AC 87.3 (Alert Feat):** Characters with the `alert` feat gain a +5 bonus to initiative and cannot be surprised while conscious.
- **AC 87.4 (Tie-Breaking):** In the event of a tie in initiative, the entity with the higher `dexterity_modifier` acts first. Further ties may be broken arbitrarily (the system may use a secondary d20 roll).
- **AC 87.5 (Storage):** The current combat initiative order may be stored in a transient `CombatSession` structure (not persisted to the main character tables).

---

### US-88: Character Advancement & XP Thresholds

**As a** player earning XP, **I want** the system to track my total experience and notify me when I reach the next level threshold **so that** I can level up my character.

- **AC 88.1 (XP Thresholds Table):** The system must enforce the following official XP-to-Level thresholds:

| Level | XP Required (Total) |
|---|---|
| 1 | 0 |
| 2 | 300 |
| 3 | 900 |
| 4 | 2,700 |
| 5 | 6,500 |

- **AC 88.2 (XP Accumulation):** XP is stored in `Character.xp` and only ever increments (never decrements).
- **AC 88.3 (Level-Up Notification):** When `Character.xp` meets or exceeds the next level threshold, the system must flag `level_up_available = true` and expose a `triggerLevelUp()` function.
- **AC 88.4 (Level-Up Effects):** Calling `triggerLevelUp()` must: (a) increment the relevant `CharacterClass.class_level`, (b) recalculate `max_hp` per the class's hit die, (c) update the `proficiency_bonus` based on total character level, (d) unlock new class features, spells, and spell slots per plan.md's progression tables.
- **AC 88.5 (Milestone Option):** As an alternative to XP, the system must support a `milestone_leveling` boolean flag on the character. When `true`, the `xp` field is ignored and level-up is triggered manually by the player or GM.

---

### US-89: Character Roster (List & Load)

**As a** player, **I want** to see a list of all my saved characters and open any one of them **so that** I can continue where I left off across multiple sessions.

- **AC 89.1:** The system must expose a `GET /characters` endpoint that returns all characters with summary data: `id`, `name`, `race`, `class(es)`, `total_level`, `current_hp`, `max_hp`, `xp`, `alignment`.
- **AC 89.2:** The UI must display this roster as a list/grid of character cards on the home screen before any character is loaded.
- **AC 89.3:** Selecting a character card loads that character into the full sheet view, restoring all state (inventory, conditions, spell slots, skills, languages, feats, etc.) exactly as it was last saved.
- **AC 89.4:** The system must expose a `DELETE /characters/:id` endpoint. Deleting a character must cascade and remove all related rows (CharacterClass, CharacterSkill, KnownSpell, SpellSlotTracker, etc.).
- **AC 89.5:** While a character is loaded, the roster is still accessible via navigation so the player can switch characters without refreshing the page.

---

### US-90: Multi-Step Creation Wizard

**As a** player, **I want** a guided step-by-step wizard when creating a new character **so that** I don't miss any mandatory choices and every step is validated before proceeding.

- **AC 90.1:** The wizard must consist of exactly these ordered steps: (1) Name + Point Buy, (2) Race / Subrace, (3) Background, (4) Class + Class Choices. No step can be skipped.
- **AC 90.2:** Each step must show a "Back" and "Next/Finish" button. The "Next" button is disabled until all mandatory selections for that step are complete.
- **AC 90.3:** The character record is only written to the database when the final step ("Finish") is confirmed. All intermediate state is held in the client.
- **AC 90.4:** On completion, the wizard transitions directly to the character sheet of the newly created character.
- **AC 90.5:** The wizard must populate every dropdown from live catalog endpoints (`/catalog/races`, `/catalog/classes`, `/catalog/backgrounds`, `/catalog/spells`, etc.) so that new catalog entries are reflected automatically without UI changes.

---

### US-91: Background Roleplay Data

**As a** player, **I want** to record my character's personality traits, bonds, ideals, and flaws during creation **so that** the character sheet reflects my character's full identity.

- **AC 91.1:** The schema must add four nullable text fields to the `Character` model: `personality_traits`, `bonds`, `ideals`, `flaws`.
- **AC 91.2:** During the Background step of the wizard, the system must present up to 8 Personality Traits, 6 Bonds, 6 Ideals, and 6 Flaws from the chosen background's catalog entry; the player must select or write at least one of each.
- **AC 91.3:** These fields are free-text editable at any time from the character sheet (not locked after creation).
- **AC 91.4:** `GET /characters/:id` must include these four fields in the response.

---

### US-92: Background Variant Selection

**As a** player choosing a background with variants (e.g., Criminal/Spy, Noble/Knight), **I want** to select a variant **so that** the correct overridden skill proficiencies and features are applied.

- **AC 92.1:** The `Background` model's `variant_rules` JSONB field must encode variant names and which proficiencies/features they replace.
- **AC 92.2:** When a background with `variant_rules` is selected, the wizard must present the variant choices; the default (base) background is always available as one of the options.
- **AC 92.3:** Selecting a variant replaces only the fields specified in `variant_rules`; all other background grants (equipment, languages, feature) remain unchanged.
- **AC 92.4:** The active variant name must be stored on the character as `background_variant` (nullable string).

---

### US-93: Class Starting Skill Selection

**As a** player, **I want** to choose the correct number of skills from my class's allowed list at character creation **so that** my proficiencies are legal per SRD rules.

- **AC 93.1:** Each class must have a `starting_skill_choices` JSONB field listing: `count` (number of skills to pick) and `pool` (array of valid skill_ids). Values per SRD:
  - Bárbaro: 2 from [Animal Handling, Athletics, Intimidation, Nature, Perception, Survival]
  - Bardo: 3 from any skill
  - Clérigo: 2 from [History, Insight, Medicine, Persuasion, Religion]
  - Druida: 2 from [Arcana, Animal Handling, Insight, Medicine, Nature, Perception, Religion, Survival]
  - Explorador: 3 from [Animal Handling, Athletics, Insight, Investigation, Nature, Perception, Stealth, Survival]
  - Guerrero: 2 from [Acrobatics, Animal Handling, Athletics, History, Insight, Intimidation, Perception, Survival]
  - Hechicero: 2 from [Arcana, Deception, Insight, Intimidation, Persuasion, Religion]
  - Mago: 2 from [Arcana, History, Insight, Investigation, Medicine, Religion]
  - Monje: 2 from [Acrobatics, Athletics, History, Insight, Religion, Stealth]
  - Paladín: 2 from [Athletics, Insight, Intimidation, Medicine, Persuasion, Religion]
  - Pícaro: 4 from [Acrobatics, Athletics, Deception, Insight, Intimidation, Investigation, Perception, Performance, Persuasion, Sleight of Hand, Stealth]
  - Warlock: 2 from [Arcana, Deception, History, Intimidation, Investigation, Nature, Religion]
- **AC 93.2:** The wizard must prevent selecting more or fewer skills than `count`.
- **AC 93.3:** Skills already granted by race or background must be shown as already proficient and must not count against the class skill pick count (they stack as expected per SRD).
- **AC 93.4:** All chosen skills are written to `CharacterSkill` with `is_proficient = true` on character creation.

---

### US-94: Starting Cantrip Selection

**As a** spellcasting player, **I want** to choose my starting cantrips from my class's cantrip list **so that** I have the correct number of cantrips known.

- **AC 94.1:** The wizard must present a cantrip-selection step for the following classes and counts (SRD):
  - Bardo: 2 cantrips from the Bard spell list
  - Clérigo: 3 cantrips from the Cleric spell list
  - Druida: 2 cantrips from the Druid spell list
  - Hechicero: 4 cantrips from the Sorcerer spell list
  - Warlock: 2 cantrips from the Warlock spell list
  - Mago: 3 cantrips from the Wizard spell list
- **AC 94.2:** Cantrips are defined as spells with `level = 0`. The selector must be pre-filtered by class via `ClassSpell`.
- **AC 94.3:** Selected cantrips are written to `KnownSpell` with `is_prepared = true` on character creation.
- **AC 94.4:** Classes not in the list above (Bárbaro, Guerrero base, Monje, Paladín, Pícaro base, Explorador) must not show this step.

---

### US-95: Starting Spell Selection

**As a** spellcasting player, **I want** to choose my starting level-1 spells at character creation **so that** my spellbook or spell list is ready from the first session.

- **AC 95.1:** The wizard must present a spell-selection step for classes that begin with known or prepared spells. Starting counts per SRD:
  - Bardo: 4 level-1 spells known (from Bard list)
  - Explorador: 0 spells at level 1 (gains at level 2 — skip this step)
  - Hechicero: 2 level-1 spells known (from Sorcerer list)
  - Mago: 6 level-1 spells known in spellbook (from Wizard list)
  - Warlock: 2 level-1 spells known (from Warlock list)
- **AC 95.2:** Clerics, Druids, and Paladins prepare spells daily and do not select known spells at creation; this step is skipped for those classes.
- **AC 95.3:** The spell selector must be pre-filtered to `level = 1` and the correct class via `ClassSpell`.
- **AC 95.4:** Selected spells are written to `KnownSpell` (`is_prepared = true` for Mago, `false` for others until explicitly prepared).

---

### US-96: Subclass Selection at Level 1

**As a** player choosing a class that grants a subclass at level 1, **I want** to select my subclass during the creation wizard **so that** its features are immediately applied.

- **AC 96.1:** The following classes grant their subclass at level 1 per SRD and must present subclass selection in the wizard: Clérigo (Divine Domain), Hechicero (Sorcerous Origin), Warlock (Otherworldly Patron).
- **AC 96.2:** For all other classes, subclass selection is deferred to the Level-Up wizard at the appropriate level (Bard L3, Druid L2, Fighter L3, Monk L3, Paladin L3, Ranger L3, Rogue L3, Wizard L2).
- **AC 96.3:** The subclass selector must be populated from `Subclass` filtered by `class_id`.
- **AC 96.4:** The chosen `subclass_id` is written to `CharacterClass.subclass_id` on creation.

---

### US-97: Fighting Style Selection

**As a** Fighter or Paladin player, **I want** to select my Fighting Style at creation **so that** its combat bonus is applied automatically.

- **AC 97.1:** Fighters choose 1 Fighting Style at level 1. Paladins choose 1 at level 2 (deferred to Level-Up wizard).
- **AC 97.2:** Valid Fighting Styles per SRD (stored in a `FightingStyle` catalog or as a Feature subset): Archery (+2 ranged attack rolls), Defense (+1 AC when armored), Dueling (+2 melee damage with one-handed weapon and no other weapon), Great Weapon Fighting (reroll 1s and 2s on damage with two-handed weapons), Protection (use reaction to impose disadvantage on attackers), Two-Weapon Fighting (add ability modifier to off-hand attack damage).
- **AC 97.3:** The chosen style is stored as a character trait/feature and its mechanical effect is applied during stat hydration.

---

### US-98: Ranger Starting Choices

**As a** Ranger player, **I want** to choose my Favored Enemy and Natural Explorer terrain at creation **so that** the correct language and terrain bonuses are active.

- **AC 98.1:** The player must select 1 Favored Enemy type from a catalog (e.g., Aberrations, Beasts, Celestials, Constructs, Dragons, Elementals, Fey, Fiends, Giants, Monstrosities, Oozes, Plants, Undead, or two humanoid races). This is stored as a character trait.
- **AC 98.2:** Choosing a humanoid Favored Enemy grants knowledge of 1 extra language of the player's choice; the wizard must present the language selector in this case.
- **AC 98.3:** The player must select 1 Natural Explorer terrain type from: Arctic, Coast, Desert, Forest, Grassland, Mountain, Swamp, Underdark. Stored as a character trait.
- **AC 98.4:** These choices are replaceable on level-up when Ranger gains additional Favored Enemy or Natural Explorer selections (levels 6 and 10).

---

### US-99: Expertise at Creation (Rogue & Bard)

**As a** Rogue or Bard player, **I want** to select my Expertise skills at creation **so that** the double-proficiency bonus applies from level 1.

- **AC 99.1:** Rogues at level 1 choose 2 skills (from their already-chosen skill proficiencies or Thieves' Tools) to gain Expertise (`is_expertise = true`).
- **AC 99.2:** Bards at level 3 gain Expertise in 2 skills (deferred to Level-Up wizard at L3).
- **AC 99.3:** The Expertise selector must only show skills the character is already proficient in, plus Thieves' Tools for Rogue.
- **AC 99.4:** `CharacterSkill.is_expertise = true` is set for chosen skills; the proficiency bonus doubles for those skills in all calculations.
- **AC 99.5:** Rogues gain 2 more Expertise at level 6 (handled by Level-Up wizard).

---

### US-100: Bard Musical Instrument Proficiencies

**As a** Bard player, **I want** to choose 3 musical instrument proficiencies at creation **so that** my character's tool kit is correctly set up.

- **AC 100.1:** The creation wizard must present a multi-select of musical instruments when the Bard class is chosen. The player must select exactly 3.
- **AC 100.2:** Musical instruments are a subset of the `Item` catalog with `item_type = 'tool'` and a `is_musical_instrument` flag (or equivalent tag in the catalog).
- **AC 100.3:** Selected instruments are written to `CharacterTool` with `is_expertise = false`.

---

### US-101: Monk Tool Proficiency at Creation

**As a** Monk player, **I want** to choose 1 artisan tool or musical instrument proficiency at creation **so that** the correct tool kit is recorded.

- **AC 101.1:** The creation wizard must present a selector containing all artisan tools and musical instruments when the Monk class is chosen. The player must select exactly 1.
- **AC 101.2:** The chosen tool is written to `CharacterTool`.

---

### US-102: Starting Equipment

**As a** player, **I want** the system to automatically grant my character's starting equipment from their background **so that** I begin play with the correct gear.

- **AC 102.1:** The `Background` model must include a `starting_equipment` JSONB field listing `item_id` references and quantities that are auto-granted on character creation.
- **AC 102.2:** On character creation, the system must iterate `starting_equipment` and create `InventoryItem` rows for each entry.
- **AC 102.3:** The system must also credit the background's `starting_gold` value to the character's `gp` field.
- **AC 102.4:** Class starting equipment (equipment packs, weapons) is presented as a choice during the Class step of the wizard; the player selects one of the official starting equipment packages, and those items are added to inventory.

---

### US-103: Level-Up Wizard

**As a** player whose character is ready to level up, **I want** a guided level-up flow **so that** all choices (HP, new features, new spells, ASI, subclass unlock) are handled correctly.

- **AC 103.1:** When `level_up_available = true` (XP threshold met or milestone), the UI must display a prominent "¡Subir de Nivel!" call-to-action on the character sheet.
- **AC 103.2:** The level-up wizard must present only the choices relevant to the class and new level. Steps are shown only if applicable:
  - HP roll or fixed average (player chooses)
  - New class features (shown as read-only unlocked features)
  - ASI or Feat choice (at levels defined in US-104)
  - New spells known (for classes that add known spells per level)
  - New cantrips (where applicable per level)
  - Subclass selection (at the correct level per class — see US-96 AC 96.2)
  - New Expertise selections (Rogue L6, Bard L3)
  - New Fighting Style (Paladin L2, Ranger L2)
- **AC 103.3:** After confirming all choices, the system writes all changes atomically: increments `class_level`, updates `max_hp`, inserts new `KnownSpell` rows, updates `SpellSlotTracker`, sets `level_up_available = false`.
- **AC 103.4:** If multiclassing, the level-up wizard must ask which class gains the level before proceeding (see US-82).
- **AC 103.5:** If the new level unlocks a subclass and none has been chosen yet, subclass selection is mandatory before finishing the wizard.

---

### US-104: Ability Score Improvement (ASI)

**As a** player reaching an ASI level, **I want** to increase two ability scores (or take a feat) **so that** my character becomes more powerful.

- **AC 104.1:** ASI is offered at the following class levels per SRD:
  - Bárbaro: 4, 8, 12, 16, 19
  - Bardo: 4, 8, 12, 16, 19
  - Clérigo: 4, 8, 12, 16, 19
  - Druida: 4, 8, 12, 16, 19
  - Guerrero: 4, 6, 8, 12, 14, 16, 19
  - Hechicero: 4, 8, 12, 16, 19
  - Mago: 4, 8, 12, 16, 19
  - Monje: 4, 8, 12, 16, 19
  - Paladín: 4, 8, 12, 16, 19
  - Pícaro: 4, 8, 10, 12, 16, 19
  - Explorador: 4, 8, 12, 16, 19
  - Warlock: 4, 8, 12, 16, 19
- **AC 104.2:** The player may either: (a) increase two different ability scores by +1 each, or (b) increase one ability score by +2, or (c) take a Feat instead (if feats are enabled).
- **AC 104.3:** No ability score can exceed 20 through ASI (FR-06).
- **AC 104.4:** After applying an ASI, all derived stats (modifiers, HP, skill bonuses, spell save DC, attack bonus) must be recalculated in the same transaction.

---

### US-105: Subclass Unlock on Level-Up

**As a** player reaching the level where my class grants a subclass, **I want** the level-up wizard to prompt me to select it **so that** all subclass features are immediately applied.

- **AC 105.1:** Subclass unlock levels per SRD:
  - Bardo: level 3 (Bard College)
  - Clérigo: level 1 (Divine Domain — handled at creation per US-96)
  - Druida: level 2 (Druid Circle)
  - Explorador: level 3 (Ranger Archetype)
  - Guerrero: level 3 (Martial Archetype)
  - Hechicero: level 1 (Sorcerous Origin — handled at creation per US-96)
  - Mago: level 2 (Arcane Tradition)
  - Monje: level 3 (Monastic Tradition)
  - Paladín: level 3 (Sacred Oath)
  - Pícaro: level 3 (Roguish Archetype)
  - Warlock: level 1 (Otherworldly Patron — handled at creation per US-96)
- **AC 105.2:** At the correct level, the level-up wizard must show a mandatory subclass selector before allowing the wizard to finish.
- **AC 105.3:** The chosen subclass is written to `CharacterClass.subclass_id`. All features tagged to that subclass at current level are immediately added to `CharacterTrait`.

---

### US-106: Dynamic HP Recalculation

**As a** player, **I want** my Max HP to always reflect my current level and Constitution modifier **so that** changes to CON (via ASI or magic items) are properly reflected.

- **AC 106.1:** Max HP must never be stored as a static value. It must be computed at hydration time from `CharacterClass` levels, class hit dice, and `constitution_modifier`.
- **AC 106.2:** Level 1 HP = `max(1, level_1_hp_base + con_mod)`, where `level_1_hp_base` is the rolled creation value when present and defaults to `hit_die` for legacy/manual API creation. Each subsequent level HP = `max(1, floor(hit_die / 2) + 1 + con_mod)` (fixed PHB average).
- **AC 106.3:** If CON changes (ASI, magical effect), the entire HP history across all levels is recalculated — the delta is added or subtracted from `current_hp` proportionally (same as the PHB ruling).
- **AC 106.4:** Hill Dwarf adds +1 HP per level (from US-10 AC 10.2); this must be included in the calculation.
- **AC 106.5:** The system must expose a `GET /characters/:id/hydrated` endpoint (or equivalent) that returns the fully derived character sheet: max_hp, AC, all skill bonuses, passive perception, initiative, spell save DC, spell attack bonus, carrying capacity, and proficiency bonus.

---

### US-107: Spell Slot & Spell Known Progression on Level-Up

**As a** spellcasting player, **I want** my spell slots and known spells to update automatically when I level up **so that** I always have the right number available.

- **AC 107.1:** On level-up, the system must consult `SpellSlotProgression` for the new class level and upsert/insert `SpellSlotTracker` rows accordingly — adding new slot levels and increasing max counts.
- **AC 107.2:** For classes with a fixed spells-known list (Bardo, Hechicero, Explorador L2+, Warlock), the level-up wizard must present the correct number of new spells to learn per the SRD progression table.
- **AC 107.3:** For Wizard, each level-up grants 2 new spells to copy into the spellbook; the wizard must prompt selection.
- **AC 107.4:** Prepared-spell classes (Clérigo, Druida, Paladín) do not have spells-known selections on level-up; their prepared count formula updates automatically.
- **AC 107.5:** Cantrip upgrades (e.g., Bard L4 +1 cantrip, Wizard L4 +1 cantrip) must be triggered at the correct level by the level-up wizard.

---

---

### US-112: PDF-Matched Character Creation Flow & Ability Score Preview

**As a** player creating a character from the mobile-first flow, **I want** the wizard screens to match the approved `Create Character.pdf` architecture **so that** each choice is made, reviewed, and explained in the same order as the product design.

- **AC 112.1 (Creation Flow Order):** The creation wizard UI must follow the approved PDF/Figma architecture, with the US-135 advanced-user override applied: Datos generales → Selección de raza → Tu selección (raza) → Trasfondo → Tu selección (trasfondo) → Rasgos de personalidad → Clase → Tu selección (clase) → Subclase when applicable per US-96 → Equipamiento → Atributos del personaje → ASI when applicable per US-121 → Habilidades de clase → Trucos / Conjuros when applicable per US-94 and US-95 → Cálculo de puntos de golpe.
- **AC 112.2 (Review Screens):** Every catalog choice represented in the PDF with a "Tu selección" screen must show a read-only review card before continuing. The review must include the selected option name, relevant badges, and Spanish explanatory copy without mutating wizard state.
- **AC 112.3 (Point Buy Base vs Final Score):** During "Atributos del personaje", controls still modify the Point Buy base score only, constrained to 8–15 and 27 points per US-85. The primary number shown to the user must be the final preview score: `base_score + racial_bonus`.
- **AC 112.4 (Explicit Racial Bonus Reasoning):** Each ability score row must display the exact reasoning used for the preview, e.g. `Base 8 + +2 raza = 10`. If the selected race has no bonus for that ability, the row must show `Base 8 + 0 raza = 8`.
- **AC 112.5 (Persistence Contract):** The wizard must submit only the base `ability_scores` values to `POST /characters`; racial bonuses are never manually added into the stored base scores. Final totals are applied by the hydration pipeline defined in `plan.md` Step 1.
- **AC 112.6 (Reactive Updates):** When a player increments or decrements a base score, the UI must update all affected values in place: final preview score, base cost, reasoning string, and remaining Point Buy budget.

---

### US-113: PDF Visual Language for Mobile Character Creation

**As a** player using the mobile creation wizard, **I want** colors, typography, cards, labels, and call-to-action styling to match the approved PDF **so that** the implemented UI preserves the intended fantasy product identity.

- **AC 113.1 (Palette):** The mobile wizard must use the PDF palette: deep brown page background, medium brown cards, warm cream/gold text accents, muted tan body copy, and red primary CTA buttons.
- **AC 113.2 (Typography):** Wizard titles and selected-option names must use a fantasy/editorial serif treatment; form labels, cards, and body copy use a compact sans-serif treatment.
- **AC 113.3 (Cards):** Race, class, background, subclass, skill, spell, and review cards must use brown surfaces with subtle tan borders and compact badges, not the previous black/blue dashboard look.
- **AC 113.4 (Primary CTA):** The main wizard action must be a red full-width "Siguiente" button in the footer area. Secondary actions must remain visually subordinate.
- **AC 113.5 (Text Matching):** Wizard screen titles and labels must use the same Spanish product wording represented in `Create Character.pdf` whenever the backend catalog allows it.
- **AC 113.6 (Figma Token Match):** When Figma access is available, the wizard must prefer the `DM-Dnd-App--Copy-` Create Character token values over inferred approximations: `#332115` page, `#462f20` cards, `#64422b` active/card chips, `#92752b` decorative border, `#bbbbbb` field/card outlines, `#ffd7ad` primary heading text, `#c4c4c4` secondary text, and `#720000` primary button.
- **AC 113.7 (Figma Layout Match):** The top wizard header must use the Figma pattern of back control + centered screen title + five horizontal progress bars. The ability editor must remain a 3-column mobile grid and not collapse to 2 columns.

---

### US-114: AI Continuity Documentation

**As a** project owner working with multiple AI assistants, **I want** continuity files that summarize project state, history, decisions, and next steps **so that** Claude or Codex can continue without relying on chat memory.

- **AC 114.1:** The project must include `HANDOFF.md` with current state, latest changes, relevant stories, technical decisions, key files, priority pending items, risks, commands, and continuity rules.
- **AC 114.2:** The project must include `CHANGELOG.md` with retroactive entries grouped by functionality, related user stories, modified files, and source/certainty.
- **AC 114.3:** `.claude.md` must instruct Claude to read `HANDOFF.md`, `CHANGELOG.md`, and `requirements.md` before modifying files.
- **AC 114.4:** After any code, configuration, or documentation change, the AI must update `CHANGELOG.md`, `HANDOFF.md`, and `requirements.md` when user stories are affected.
- **AC 114.5:** Uncertain historical data must be marked as `Inferido` or `Pendiente de validación`.

### US-115: Wizard Navigation State and External Styling

**As a** player creating a character on mobile, **I want** the wizard controls to reflect whether the current step is complete and to provide a clear cancel/back affordance **so that** I cannot accidentally advance with missing required data and can leave creation predictably.

- **AC 115.1:** The creation wizard header must include a back/cancel control that closes the wizard from the first step and navigates backward from later steps.
- **AC 115.2:** The primary `Siguiente` action must be disabled until the current required fields or selections are valid.
- **AC 115.3:** Step validation must run after relevant input changes, selections, and point-buy adjustments.
- **AC 115.4:** Wizard styles must live in `style.css`, and `ui.html` must reference it via a stylesheet link.
- **AC 115.5:** Externalizing CSS must preserve the PDF/Figma visual contract from US-113.

### US-116: Auto-Advance Selection Reviews and Rolled Creation HP

**As a** player using the PDF-matched creation wizard, **I want** race, background, class, and subclass selections to immediately show their "Tu selección" review card, and I want my hit die roll to define base HP **so that** the flow matches the intended mobile design without extra taps.

- **AC 116.1:** Selecting a race automatically advances from `Selección de Raza` to `Tu selección` for race.
- **AC 116.2:** Selecting a background automatically advances from `Trasfondo` to `Tu selección` for background.
- **AC 116.3:** Selecting a class automatically advances from `Clase` to `Tu selección` for class.
- **AC 116.4:** Selecting a level-1 subclass automatically advances to a `Tu selección` subclass review card before continuing.
- **AC 116.5:** All `Tu selección` screens must render inside visible card containers with selected option name, badges, and explanatory copy.
- **AC 116.6:** The HP step must require a hit die roll before finishing character creation.
- **AC 116.7:** The rolled hit die result is sent as `hp_roll_base` and persisted as `level_1_hp_roll`; derived max HP uses `roll + constitution_modifier` for level 1 and fixed average for later levels.

### US-117: Figma-Matched Character Detail Microflow and Bottom Navigation

**As a** mobile player, **I want** the roster, bottom navigation, and character detail view to follow the approved Figma microflow **so that** opening a character feels like a coherent app flow even while secondary sections are still placeholders.

- **AC 117.1:** The bottom navigation must expose the four Figma destinations: `Glosario y reglas`, `Personajes`, `Objetos y tienda`, and `Razas y clases`.
- **AC 117.2:** Non-implemented bottom navigation destinations must still open explicit placeholder screens instead of being omitted from the architecture.
- **AC 117.3:** Tapping a character card opens a character detail microflow with a header containing `Atrás`, the character name, and `Tirar Dado`.
- **AC 117.4:** The bottom navigation must be hidden while the character detail microflow is open, and `Atrás` must return to the roster.
- **AC 117.5:** The character detail screen must include the Figma tab structure: `Ficha`, `Habilidades`, `Conjuros`, `Diario`, and `Inventario`.
- **AC 117.6:** The `Ficha` tab must show biography, combat summary, XP progress, ability scores, and spellcasting summary using the Figma brown/cream/red visual language.
- **AC 117.7:** The Figma combat summary in the opened character `Ficha` must show exactly `CA`, `Velocidad`, `Nivel`, and `B. Comp.` / proficiency bonus as visible cards; initiative is not part of that Figma row.
- **AC 117.8:** Secondary tabs may use compact summaries or placeholders until their full product sections are implemented, but the navigation flow must remain accessible.

### US-118: Character Image Upload and Figma-Matched Detail Subflows

**As a** mobile player viewing a created character, **I want** to upload a character image and navigate skills, saving throws, cantrips, and spells using the Figma subflows **so that** the character sheet behaves like the approved design instead of a flat data dump.

- **AC 118.1:** The character detail hero image area must allow the user to upload an image from their device.
- **AC 118.2:** Uploaded character images must be adapted to the platform image area using fixed sizing and `cover` cropping without distorting the source image.
- **AC 118.3:** The uploaded image must remain available for the same browser/device session after refreshing the local UI.
- **AC 118.4:** Before saving browser-local image data, the UI must resize and compress the selected file to reduce local storage failures.
- **AC 118.5:** Uploaded character images must persist through the backend so they remain available after login, refresh, and device changes for the same profile.
- **AC 118.6:** The backend must reject invalid image payloads and enforce a maximum compressed data size.
- **AC 118.4:** The `Habilidades` tab must contain a secondary tab switch between `Habilidades` and `Tiradas de salvación`.
- **AC 118.5:** Skill rows and saving throw rows must be rendered separately, each with proficiency indicator, name, and calculated bonus.
- **AC 118.6:** The `Conjuros` tab must contain a secondary tab switch between `Trucos` and `Conjuros`.
- **AC 118.7:** Cantrips/spells must render as Figma-style cards with name, school badge, metadata chips, summary copy, and a `Ver más información` affordance.
- **AC 118.8:** Until backend image persistence exists, image storage may be browser-local and must be documented as a limitation.

### US-119: Figma-Matched Created Character Card

**As a** mobile player on the `Personajes` screen, **I want** created character cards to match the approved Figma component **so that** the roster has the same hierarchy, density, and visual language as the product design.

- **AC 119.1:** The created character card must use the Figma `beast-card-B` structure: decorative background, 16px padding, 2px radius, and compact 358px-wide mobile layout.
- **AC 119.2:** The card header must show race and class metadata before the character name.
- **AC 119.3:** The character name must use the Figma heading treatment.
- **AC 119.4:** Edit and delete actions must appear inside the card header area as compact red buttons.
- **AC 119.5:** Quick info must show armor class, walking speed, current hit points, and level in one compact row.
- **AC 119.6:** The card must show a short biography/personality summary below quick info.
- **AC 119.7:** Tapping the card must still open the character detail microflow, while edit/delete buttons must not trigger card opening.

### US-120: Figma-Matched Add Character CTA

**As a** mobile player on the `Personajes` screen, **I want** the add-character CTA to match the approved Figma prototype **so that** creating a new character uses the same visual hierarchy as the roster.

- **AC 120.1:** The add-character CTA must appear below the created character card list when characters exist.
- **AC 120.2:** The CTA must use the Figma button treatment: full-width 358px mobile layout, 44px height, red background `#720000`, decorative border `#92752b`, 4px radius, plus icon, and text `Agregar nuevo personaje`.
- **AC 120.3:** The CTA must open the existing character creation wizard.
- **AC 120.4:** Empty state creation must remain available even when no character cards exist.

### US-121: High-Level Character Creation Guardrails

**As a** player creating a character above level 1, **I want** subclass, ASI, cantrip, spell, and HP choices to scale correctly with the chosen starting level **so that** the created character is valid immediately and its detail sheet shows the expected magic options.

- **AC 121.1:** If the selected class unlocks a subclass at or before `initial_level`, the API must require and persist a valid subclass from that class.
- **AC 121.2:** If a subclass is submitted before the class unlock level, the API must reject the request with a Spanish client-facing error.
- **AC 121.3:** ASI choices must be validated against class milestones: Fighter `[4,6,8,12,14,16,19]`, Rogue `[4,8,10,12,16,19]`, all other classes `[4,8,12,16,19]`.
- **AC 121.4:** ASI payloads must use only valid ability keys (`str`, `dex`, `con`, `int`, `wis`, `cha`), must assign exactly 2 points per earned ASI, and must not raise any final ability score above 20.
- **AC 121.5:** The wizard must not allow the player to continue from the ASI step until all earned ASI points are assigned.
- **AC 121.6:** Cantrip and spell selections must match the expected count for the selected class and level.
- **AC 121.7:** Prepared-spell classes must still create visible known/prepared spell rows: Cleric and Druid use `class_level + spellcasting_modifier`, Paladin uses `floor(class_level / 2) + spellcasting_modifier` starting at level 2, and Wizard uses spellbook count `6 + 2 * (level - 1)`.
- **AC 121.8:** Submitted spells must belong to the selected class spell list and must not exceed the maximum spell level available to that class at `initial_level`.
- **AC 121.9:** HP preview and backend HP creation must use Constitution after racial bonuses and ASI bonuses.

### US-122: Figma-Matched Creation Equipment and Inventory Detail

**As a** player creating or reviewing a character, **I want** class equipment choices to be part of the creation flow and visible in the inventory with useful item details **so that** the character starts play with complete, understandable gear.

- **AC 122.1:** The creation wizard must include an `Equipamiento` screen after skills/spells and before hit points.
- **AC 122.2:** The `Equipamiento` screen must follow the Figma layout: title, class-equipment caption, grouped choice cards, per-group `Elige 1` counter, selected card state, item chips, and red full-width continuation CTA.
- **AC 122.3:** Each class-equipment group must require one selected option before the wizard can continue.
- **AC 122.4:** Equipment choices must be submitted to the backend during character creation and persisted in inventory.
- **AC 122.5:** Equipment packs must unpack into their contained items while preserving quantities.
- **AC 122.6:** A character created before this flow, with no detectable class equipment in inventory, must be able to choose class equipment from the Inventory tab.
- **AC 122.7:** Once equipment exists, the Inventory tab must show item quantity, item type, core attributes such as damage, AC, weight, value or properties, and a brief description.
- **AC 122.8:** The creation wizard must load the item catalog before final character creation so selected equipment can always resolve to item IDs.
- **AC 122.9:** Retroactive equipment assignment from the Inventory tab must be idempotent: if selected equipment items already exist, saving again must not increment quantities.

### US-123: Equipment State and Hand-Occupancy Rules

**As a** player managing inventory, **I want** weapons, shields, armor, and ammunition to equip with sensible DnD hand rules **so that** the sheet clearly identifies what is currently usable without allowing contradictory equipment states.

- **AC 123.1:** Equippable inventory cards for weapons, armor, shields, and ammunition must show an `Equipar` / `Desequipar` action.
- **AC 123.2:** Equipped objects must be visually identified in the inventory.
- **AC 123.3:** Equipping body armor must automatically unequip any other body armor while allowing a shield to remain equipped.
- **AC 123.4:** Equipping a shield must allow at most one one-handed weapon and must unequip two-handed/ranged weapons and extra weapons.
- **AC 123.5:** Equipping a two-handed weapon, bow, or crossbow must unequip other weapons and shields.
- **AC 123.6:** Equipping a one-handed weapon may coexist with a shield, or with one additional one-handed weapon if both are light or the primary martial class supports dual-weapon use.
- **AC 123.7:** Equipping bows must auto-equip arrows when present; equipping crossbows must auto-equip bolts when present.
- **AC 123.8:** Pack/kit descriptions must list included articles and quantities when pack contents are available.
- **AC 123.9:** Ammunition catalog entries with bundle notation such as `Arrows (20)` or `Crossbow Bolts (20)` must render with the clean item name (`Flechas`, `Virotes`) and show the effective unit quantity (`x20`) instead of duplicating the bundle count in both name and quantity.
- **AC 123.10:** Equipped ammunition must match the equipped ranged weapon family: bows use arrows, crossbows use bolts, slings use bullets, and blowguns use needles. Equipping a ranged weapon must clear incompatible ammunition, manually equipping incompatible ammunition must be rejected, and legacy invalid inventory states must not display incompatible ammunition as equipped.

### US-124: Consumable Use and Virtual Dice Modal

**As a** player managing inventory, **I want** kits to expand into individual articles and consumables to resolve their effects through platform-styled controls **so that** inventory quantities and character stats stay synchronized during play.

- **AC 124.1:** Existing pack/kit inventory entries must expose an action to open the kit and add all contained articles as individual inventory rows.
- **AC 124.2:** Opening a kit must decrement the kit quantity by one and preserve the quantities of all contained articles.
- **AC 124.3:** Consumable items such as potions, rations, torches, candles, oil, holy water, acid, alchemist fire, antitoxin, and poison must expose a `Usar` action when present in inventory.
- **AC 124.4:** Using a consumable must decrement its quantity by one, deleting the inventory row when quantity reaches zero.
- **AC 124.5:** Consumables with dice expressions must open a platform-styled virtual dice modal before applying the effect.
- **AC 124.6:** Healing consumables must apply the rolled healing amount to `current_hp` without exceeding computed max HP.
- **AC 124.7:** Damage or external-effect consumables must show the rolled result and consume the item; effects without an internal character stat target may be reported for table resolution.
- **AC 124.8:** Healing consumables that use dice must require a rolled total and must add only that total to current hit points; they must not reset current hit points to maximum or overwrite the value directly.
- **AC 124.9:** If applying a consumable fails, the dice modal must remain open so the player can retry; if the consumable is applied but the inventory refresh fails, the UI must keep the applied HP result and show a non-blocking refresh warning.

### US-125: Figma-Matched Hit Point Summary and Adjustment Modals

**As a** mobile player viewing a created character, **I want** current hit points and temporary hit points to appear in the open-character Figma layout with modal editing **so that** table-time damage, healing, and temporary HP changes can be managed without leaving the character detail flow.

- **AC 125.1:** The `Ficha` tab of the open-character screen must show two Figma-style cards before combat stats: `Puntos de Golpe` with current and max HP, and `Puntos de Golpe temporales`.
- **AC 125.2:** The HP section must include the Figma red full-width button `Ajustar puntos de golpe`.
- **AC 125.3:** Tapping `Ajustar puntos de golpe` must open the full-screen Figma modal flow from nodes `2052:305` / `2052:472`, with header, back arrow, HP summary cards, steppers, explanatory text, and `Guardar cambios` CTA.
- **AC 125.4:** The modal must support editing exact current HP and exact temporary HP through minus/plus controls.
- **AC 125.5:** Healing and exact HP setting must not raise `current_hp` above computed max HP.
- **AC 125.6:** Moving from 0 HP to positive HP through healing or exact HP setting must reset death saves and clear unconscious state.
- **AC 125.7:** After any HP adjustment, the visible character sheet, mini-sheet, and modal values must refresh from the API.

### US-126: Global Request Loader

**As a** mobile player using the platform, **I want** visible feedback while the app is loading or saving data **so that** I understand the request is being processed and avoid repeated taps.

- **AC 126.1:** The UI must show a global platform-styled loader during API requests.
- **AC 126.2:** The loader must use the DnD visual language: brown overlay, card surface, cream text, and loading animation.
- **AC 126.3:** GET requests should communicate that information is loading, while write requests should communicate that changes are being saved.
- **AC 126.4:** The loader must remain visible until all concurrent API requests finish.
- **AC 126.5:** The loader must set accessible loading state using `role="status"`, `aria-live`, `aria-hidden`, and `aria-busy`.

### US-127: Rules-Rich Item and Spell Descriptions

**As a** player reading inventory and magic options, **I want** item, spell, and cantrip cards to show robust rule-driven descriptions and clean attributes **so that** I can understand their use without cluttered or misleading tags.

- **AC 127.1:** Item cards must derive descriptions from catalog fields when explicit descriptions are missing, including weapon damage, weapon family, range, armor category, AC, Strength requirements, stealth disadvantage, consumible effects, focus use, and pack contents.
- **AC 127.2:** Weapon tags must identify simple/martial training, melee/ranged/thrown use, damage dice/type, range, and relevant properties such as light, heavy, finesse, versatile, loading, reach, ammunition, and two-handed.
- **AC 127.3:** Armor tags must identify light, medium, heavy, or shield category, AC behavior, Strength requirements, stealth disadvantage, weight, and value when available.
- **AC 127.4:** Ammunition tags and descriptions must identify the compatible weapon family without mixing incompatible ammunition states.
- **AC 127.5:** Spell and cantrip cards must show level/type, school, components, range, casting time, duration, concentration, and mechanical effects such as damage, healing, saving throw, area, targets, resistance, or temporary hit points when catalog data includes them.
- **AC 127.6:** Attribute tags must avoid decorative emojis so tags remain clean and rule-readable.

### US-128: Figma-Matched Attack Dice Flow

**As a** mobile player viewing a created character, **I want** the `Tirar Dado` action to open the Figma attack dice flow **so that** weapon attacks can be resolved step by step during play.

- **AC 128.1:** The character detail header action `Tirar Dado` must open a full-screen `Lanzar Dado` flow using the Figma brown/cream/red visual language.
- **AC 128.2:** The first screen must expose the Figma options: `Ataque`, `Lanzamiento de conjuro`, `Resolución de historia`, `Tirada de salvación`, and a custom dice entry.
- **AC 128.3:** Choosing `Ataque` must list equipped weapons as Figma-style cards with weapon type, name, primary/secondary badge, rule chips, description, and `Atacar` CTA.
- **AC 128.4:** Selecting a ranged weapon with ammunition must show compatible ammunition availability and must decrement one unit whether the d20 attack roll succeeds or fails.
- **AC 128.5:** A natural 20 must show the critical-success screen and route to damage with doubled damage total.
- **AC 128.6:** A natural 1 must show the critical-failure screen and avoid damage calculation.
- **AC 128.7:** Non-critical attack rolls must route to `¿Éxito o fallo?`, allowing the player to confirm DM/AC outcome before rolling damage.
- **AC 128.8:** Damage calculation must roll the selected weapon damage dice and display `Daño total inflingido`, including critical doubling when applicable.
- **AC 128.9:** Finishing the flow must refresh the character sheet/inventory so consumed ammunition is reflected.
- **AC 128.10:** Ammunition quantities shown after attacks must reflect remaining unit count, for example `Flechas x19` after firing once from `Flechas x20`; display logic must not clamp remaining ammunition back to the catalog bundle size.

### US-129: Figma-Matched Spell Dice Flow

**As a** mobile spellcaster, **I want** the dice launcher to support cantrip and spell casting flows from Figma **so that** spell effects, saves, slots, and damage dice can be resolved without leaving the character detail.

- **AC 129.1:** Choosing `Lanzamiento de conjuro` must open the Figma `Truco` / `Conjuro` tab layout.
- **AC 129.2:** Cantrips must state that they do not consume spell slots.
- **AC 129.3:** Spells must show available spell slots by level before casting.
- **AC 129.4:** Spell cards must show name, school badge, component/range/duration chips, effect summary, `Ver más información`, and `Atacar` CTA.
- **AC 129.5:** Selecting a spell must open the Figma `Dado a lanzar` screen with a dice selector derived from catalog effects/description.
- **AC 129.6:** The flow must support multiple dice choices when catalog text exposes them, for example `1d8` or `1d12`.
- **AC 129.7:** Rolling a cantrip must not consume a spell slot.
- **AC 129.8:** Rolling a leveled spell must call the cast endpoint and consume one matching standard spell slot before showing the result.
- **AC 129.9:** Result screens must show total damage and, when catalog data includes a saving throw, instruct the player to ask the DM for the target save against the character spell save DC.

### US-130: Animated Virtual Dice Feedback

**As a** mobile player resolving dice in the platform, **I want** dice rolls to show a short rolling animation before the final value **so that** attacks, spells, custom rolls, and consumables feel responsive and tabletop-like.

- **AC 130.1:** Attack d20 rolls must animate before showing the final d20 result.
- **AC 130.2:** Weapon damage rolls must animate before showing the final damage total.
- **AC 130.3:** Spell/cantrip dice rolls must animate before showing the effect result.
- **AC 130.4:** Custom/story/saving throw rolls must animate before showing the result.
- **AC 130.5:** Consumable dice modals must animate the virtual dice before enabling effect application.
- **AC 130.6:** Roll buttons must be disabled while the animation is running to prevent double rolls.
- **AC 130.7:** The animation must respect `prefers-reduced-motion` by disabling motion-heavy effects for users who request reduced motion.

### US-131: Weapon Attack Proficiency and Skill Proficiency Visibility

**As a** player resolving actions from an opened character, **I want** weapon attacks and skill lists to show when proficiency applies **so that** I can trust the dice totals and understand what my character is trained to do.

- **AC 131.1:** Weapon attack rolls in the `Tirar Dado` attack flow must calculate total attack as `d20 + relevant ability modifier + proficiency_bonus` only when the character is proficient with that weapon.
- **AC 131.2:** The relevant ability modifier must follow DnD weapon rules: melee and thrown melee weapons use Strength by default, ranged weapons use Dexterity, and finesse weapons use the higher of Strength or Dexterity.
- **AC 131.3:** Weapon proficiency detection must support class-granted simple/martial weapon groups and specific racial/class weapon proficiencies such as longsword, shortsword, shortbow, longbow, rapier, hand crossbow, dagger, dart, sling, quarterstaff, and light crossbow.
- **AC 131.4:** The attack flow must display the formula behind the total, including the d20 result, ability modifier, whether proficiency was added, and the final total.
- **AC 131.5:** Equipped weapon cards in the attack flow must show an `Ataque +X` tag and a `Competente` / `Sin competencia` tag.
- **AC 131.6:** The character detail `Habilidades` tab must clearly separate `Habilidades` from `Tiradas de salvación` and show which rows are proficient, expert, or not proficient.
- **AC 131.7:** The proficiency display must use the established mobile visual language of the platform: brown panels, cream/red accents, compact badges, and no decorative emojis in rule tags.
- **AC 131.8:** The character detail `Habilidades` area must expose equipment competencies separately, including weapon groups/specific weapons, armor categories, shields, tools, and item-related proficiencies when available from class, race, background, traits, or stored character tool records.

### US-132: Player Profiles and Owned Character Roster

**As a** player using the platform, **I want** to create a free profile and log in **so that** I can create and view only my own characters.

- **AC 132.1:** The platform must allow a player to register with email, password, and optional visible display name.
- **AC 132.2:** The platform must allow a registered player to log in and receive a session token without requiring a paid external service.
- **AC 132.3:** The UI must attach the active session token to API requests that create, list, read, edit, delete, or modify character state.
- **AC 132.4:** When a player is logged in, `GET /characters` must return only characters owned by that player.
- **AC 132.5:** When a logged-in player creates a character, the backend must persist that character with the active profile owner.
- **AC 132.6:** When a logged-in player requests or mutates a character that belongs to another profile, the backend must reject the request with a Spanish client-facing error.
- **AC 132.7:** Existing legacy characters without `user_id` must remain compatible with the current local development flow and must not be deleted or reassigned automatically.
- **AC 132.8:** The UI must show login/register screens before the roster when no active session exists, and must provide a way to close the session.
- **AC 132.9:** Authentication data must store password hashes, not plaintext passwords.
- **AC 132.10:** The required database migration and setup notes must be documented for continuity.
- **AC 132.11:** Password hashes must use a one-way salted KDF with a server-side pepper derived from `AUTH_SECRET`; legacy password hashes may be verified only for backward compatibility.
- **AC 132.12:** Production must reject startup when `AUTH_SECRET` is missing or left at the development fallback.
- **AC 132.13:** Session tokens must not embed password hashes or unnecessary profile PII; the token payload should identify the user by subject and expiration only.

### US-133: Safe GitHub Repository and GitHub Pages Publication

**As a** project owner, **I want** the project prepared for a public GitHub repository and GitHub Pages static deployment **so that** I can share the UI without exposing secrets, database credentials, or private service endpoints.

- **AC 133.1:** The repository must ignore local environment files such as `.env` and `.env.*` while keeping `.env.example`.
- **AC 133.2:** The GitHub Pages deployment must publish only static public files required by the UI.
- **AC 133.3:** Public browser configuration must live in a separate file that contains only public URLs and no secrets.
- **AC 133.4:** The UI must not depend on private Figma MCP asset URLs or other private design-service URLs at runtime.
- **AC 133.5:** Documentation must state clearly that GitHub Pages cannot run the Express/Prisma backend.
- **AC 133.6:** Documentation must explain that login, profiles, and character data require a backend API deployed separately from GitHub Pages.
- **AC 133.7:** The project must include a pre-publication security check that scans for common secret leaks and unsafe public dependencies.
- **AC 133.8:** The release preparation must be validated with typecheck, tests, and security check.

### US-134: Public Backend API Deployment

**As a** project owner, **I want** the Express/Prisma API prepared for a free public backend deployment **so that** the GitHub Pages UI can connect to profiles, characters, inventory, spells, and rules through HTTPS.

- **AC 134.1:** The backend must expose `/health` for deployment health checks.
- **AC 134.2:** The backend must read `PORT` from the host environment and continue to work locally.
- **AC 134.3:** Production CORS must be restricted by an `ALLOWED_ORIGINS` environment variable instead of allowing every public origin.
- **AC 134.4:** Deployment configuration must not include real `DATABASE_URL`, `AUTH_SECRET`, or private credentials.
- **AC 134.5:** Deployment scripts must generate Prisma Client, apply pending migrations with `prisma migrate deploy`, build TypeScript, and start the compiled server.
- **AC 134.6:** Documentation must clarify that the API should use a separate HTTPS origin from GitHub Pages, for example a Render URL or `api.migueleo.com`.

### US-135: Hardcore Race Ordering and Late Attribute Allocation

**As a** rules-focused player, **I want** race options grouped by parent race/family and ability scores placed near the end of creation **so that** character creation follows a clearer DnD mental model and avoids deciding attributes before ancestry/class context is understood.

- **AC 135.1:** The race selection UI must group selectable variants by race family, keeping related options adjacent: dwarves, elves, halflings, gnomes, humans, dragonborn, half-elves, half-orcs, tieflings, and other future families.
- **AC 135.2:** Elf variants must render together with `Drow`, `Elfo Alto`, and `Elfo del Bosque` in the configured family order rather than being separated alphabetically.
- **AC 135.3:** The grouping logic must support future tiefling subraces when the catalog contains validated rows, but must not invent unsupported tiefling mechanics if the current catalog only contains base `tiefling`.
- **AC 135.4:** The creation wizard must move `Atributos del personaje` out of the early race section and place it in the late creation phase after race/background/class/equipment context, before skills/conjuro validation and hit point rolling.
- **AC 135.5:** Attribute controls must continue to show final scores as `base + bono racial` with explicit reasoning and must still submit only base Point Buy values to the API.

### US-136: Ability Score Recommendation Engine

**As a** player creating a character, **I want** the app to suggest an optimized Point Buy distribution from my race, class, and background **so that** I can make a competent character without needing to know every DnD build rule in advance.

- **AC 136.1:** The attributes step must display an explicit recommended distribution before the manual Point Buy controls.
- **AC 136.2:** The recommendation must prioritize class role first, then adjust secondary priorities with background identity, then show racial bonuses in the final preview.
- **AC 136.3:** Applying the recommendation must update only `ability_scores` base Point Buy values and must not store racial bonuses in the base payload.
- **AC 136.4:** The UI must explain in Spanish why the distribution was suggested, referencing the selected class, background, and race.
- **AC 136.5:** The suggested base array must remain valid under Point Buy limits: 8–15 per ability and 27 points total.

### US-137: Figma-Matched Inventory Section

**As a** player managing a created character, **I want** an inventory section matching the Figma architecture **so that** I can separate equipped gear, backpack contents, stored loot, and add objects through a clear mobile flow.

- **AC 137.1:** The character detail `Inventario` tab must contain internal sections `Equipo`, `Mochila`, and `Alijo`.
- **AC 137.2:** `Equipo` must show equipped slots, including primary weapon, secondary weapon, shield, armor, boots, gloves/gauntlets, rings, and amulet; empty slots must show the Figma-style dashed empty state.
- **AC 137.3:** `Mochila` must show the current inventory list and provide an `Agregar objeto` action.
- **AC 137.4:** `Alijo` must group non-equipped non-consumable objects until a dedicated storage/location model is validated.
- **AC 137.5:** The add-object flow must include search, filter chips, item cards, item descriptions/tags, and a quantity confirmation screen before calling the inventory API.
- **AC 137.6:** Coin adding (`PO`, `PP`, `PC`) is visible as a Figma-aligned affordance but remains pending backend modeling and must not fake persistence.

---

### US-138: Carry / Coins Card in Mochila Tab

**As a** player managing a character's inventory, **I want** a visible carry capacity and coin summary card in the Mochila tab **so that** I know at a glance how much weight I'm carrying and what currencies I have.

- **AC 138.1:** The Mochila tab must display a card showing current carried weight, max carrying capacity, and a visual progress bar.
- **AC 138.2:** The card must show coin columns for PO (gold), PP (silver), and PC (copper) with distinct icon colors and bold values.
- **AC 138.3:** Carried weight must be derived from the engine (`hydrate.ts`) and reflect equipped and carried item weights plus coin weight.
- **AC 138.4:** The progress bar must change color or style when encumbered.

---

### US-139: Full Item-Stat Hydration via Engine

**As a** player using the character sheet, **I want** all equipped item effects (AC, speed penalty, stealth disadvantage, encumbrance) to be reflected immediately in the character sheet **so that** the stats shown always match the rules for what I have equipped.

- **AC 139.1:** The `/hydrated` endpoint must use `buildRawCharacter()` and `hydrate()` to derive all computed stats; no manual stat calculation is allowed in the controller.
- **AC 139.2:** AC must reflect the equipped body armor category (light/medium/heavy) and shield, following SRD rules.
- **AC 139.3:** Speed must reflect heavy armor penalty (`-10 ft`) when `STR < strength_requirement`.
- **AC 139.4:** A stealth disadvantage badge must appear when any equipped item has `stealth_disadvantage = true`.
- **AC 139.5:** Max HP must use the actual `level_1_hp_roll` value when available, not always the hit die maximum.
- **AC 139.6:** Encumbrance (carried weight, capacity, is_encumbered) must be present in the hydrated response.

---

### US-140: Story Resolution Dice Flow

**As a** player rolling dice for a narrative action, **I want** to pick a skill and roll a d20 with automatic advantage/disadvantage detection **so that** I can share a clear, rule-compliant result with my Dungeon Master.

- **AC 140.1:** The "Resolución de historia" option in the dice menu must open a dedicated skill-picker screen, not the generic roll flow.
- **AC 140.2:** The skill-picker must list all 18 skills with their computed bonuses from the hydrated character; the selected skill must be visually highlighted.
- **AC 140.3:** The "Lanzar dado" CTA must remain disabled until a skill is selected.
- **AC 140.4:** If the selected skill is Stealth and any equipped item has `stealth_disadvantage = true`, two dice must be shown and the lower result used; an explanatory note must appear.
- **AC 140.5:** Active conditions (frightened, poisoned, restrained, exhaustion ≥ 3) must also trigger disadvantage with two dice.
- **AC 140.6:** The result screen must show the winning die nítido and the losing die dimmed (opacity ≤ 0.45).
- **AC 140.7:** The final result shown must equal the winning die value plus the skill modifier.
- **AC 140.8:** A "Terminar" button must close the flow after the result is displayed.

---

### US-141: Full Spanish Localisation of Items and Spells

**As a** Spanish-speaking player, **I want** all item and spell names to appear in Spanish throughout the UI **so that** the experience is fully localised without affecting backend data integrity.

- **AC 141.1:** `ITEM_NAME_ES` must cover all 257 SRD items including armor, weapons, ammunition, gear, tools, instruments, packs, potions, arcane/druidic focuses, and magic items.
- **AC 141.2:** `SPELL_NAME_ES` must cover all 410 SRD spells across levels 0–9.
- **AC 141.3:** All UI render sites that display item or spell names must pass through the translation map with English fallback.
- **AC 141.4:** Backend lookup fields (item `name`, spell `name`) must remain in English; translations are UI-only.

---

## Implementation Status Addendum — 2026-04-30

> Source priority: current code first, existing documentation second, available chat context third. Items marked `Pendiente de validación` require a full runtime/database verification before being treated as complete.

| Story range | Estado | Evidencia |
| :--- | :--- | :--- |
| US-01 to US-06 | Implementada | Confirmado por services and unit tests for Point Buy, modifiers, HP, AC-related math, and combat dice helpers. |
| US-07 to US-21 | Implementada / pendiente de validación de contenido completo | Race and subrace catalog exists in Prisma schema and seed files. Exact SRD completeness should be validated against seeded rows. |
| US-22 to US-47 | Implementada / pendiente de validación de contenido completo | Class, subclass, feature, resource, spellcasting, and progression structures exist in schema/seeds/services. Exact per-class feature completeness should be validated against seed data. |
| US-48 to US-61 | Implementada / pendiente de validación de contenido completo | Background schema, seed data, roleplay fields, and wizard personality fields exist. Background variants need runtime validation. |
| US-62 to US-69 | Implementada / pendiente de validación completa | Item/inventory schema, InventoryService, and inventory endpoints exist. Full pack and equipment behavior should be exercised against the database. |
| US-70 to US-88 | Implementada en motor principal | Services and controllers cover death saves, rests, concentration, spell slots, conditions, multiclassing, feats, languages, initiative, and XP. The concentration DC unit test now expects the documented rule `max(10, floor(damage/2))`. |
| US-89 to US-107 | En progreso / parcialmente implementada | Character roster, creation, edit, hydrated sheet, skills, languages, known spells, XP, level-up, and spell slot progression exist. Level-up wizard choices for spells/ASI/subclass are not fully represented in the current UI. |
| US-108 to US-109 | Implementada | Confirmed by current wizard code for in-place selection updates and contextual skill descriptions/bonuses. |
| US-110 to US-111 | Implementada / pendiente de validación final | Backend `PATCH /characters/:id`, initial level in `POST /characters`, and edit modal exist. Full browser/API regression remains recommended. |
| US-112 to US-113 | En progreso / pendiente de validación visual | Current `ui.html` and `style.css` implement the PDF/Figma-matched mobile wizard flow, racial ability preview, tokens, header, and disabled state. Exact 1:1 PDF/Figma match remains pending visual QA; US-135 intentionally supersedes the early placement of attributes based on advanced-user feedback. |
| US-114 | Implementada | `HANDOFF.md`, `CHANGELOG.md`, and `.claude.md` continuity instructions are maintained as part of this documentation pass. |
| US-115 | Implementada | Current `ui.html` has header back/cancel behavior and validation-based primary button state; `style.css` contains extracted styling. |
| US-116 | Implementada / pendiente de validación visual | Current `ui.html` auto-advances selection screens to review cards, adds subclass review, requires HP roll, and sends `hp_roll_base`; Prisma/API persist `level_1_hp_roll`. |
| US-117 | Implementada / pendiente de validación visual | Current `ui.html` adds the Figma bottom navigation destinations, placeholder screens, and a character detail microflow with internal tabs; the opened-character summary now shows CA, Velocidad, Nivel and visible B. Comp. matching the Figma row. Visual QA against Figma remains recommended. |
| US-118 | Implementada / pendiente de validación E2E en producción | Current `ui.html` compresses uploaded character images, sends them to `PATCH /characters/:id/image`, persists `Character.image_data`, and keeps local cache as fallback. Skills/saving throws and cantrips/spells remain separated in Figma-style detail subflows. |
| US-119 | Implementada / pendiente de validación visual | Current `ui.html` and `style.css` render created character cards with the Figma `beast-card-B` hierarchy, quick info row, action buttons, and biography summary. |
| US-120 | Implementada / pendiente de validación visual | Current `ui.html` and `style.css` render the Figma full-width add-character CTA below the roster card list while preserving empty-state creation. |
| US-121 | Implementada / pendiente de validación E2E con base de datos | Backend validates subclass unlocks, ASI milestones/caps, exact cantrip/spell counts, class spell availability, and prepared-spell counts; UI requires ASI before spells and uses ASI-aware HP/spell calculations. Verified by `npm run typecheck`, `npm run test`, and HTML script parse. |
| US-122 | Implementada / pendiente de validación visual y E2E con base de datos | Current `ui.html`, `style.css`, `character.controller.ts`, and `inventory.controller.ts` add the Figma-style `Equipamiento` wizard step, persist selected class gear, unpack packs by `item`/`qty`, load item catalog before creation, render rich inventory cards, and apply fallback equipment idempotently for older characters. |
| US-123 | Implementada / pendiente de validación E2E con base de datos | Current `inventory.controller.ts` applies hand-occupancy rules for armor, shields, weapons, and ammunition; current `ui.html` and `style.css` show equip actions, equipped state, pack contents, normalized ammunition names/quantities, and rejects incompatible ammunition for equipped ranged weapons. Verified by `npm run typecheck`, `npm run test`, and HTML script parse. |
| US-124 | Implementada / pendiente de validación E2E con base de datos | Current `inventory.controller.ts` adds a use endpoint for packs and consumables; current `ui.html` and `style.css` add `Abrir kit`, `Usar`, virtual dice modal, additive healing application, retry-safe modal behavior, and inventory refresh. Verified by `npm run typecheck`, `npm run test`, and HTML script parse. |
| US-125 | Implementada / pendiente de validación visual en navegador | Current `ui.html`, `style.css`, `combat.controller.ts`, and `character.controller.ts` add the Figma HP summary section, full-screen Figma HP modal (`2052:305` / `2052:472`), exact current/temp HP editing, and max-HP-safe healing/current HP updates. |
| US-126 | Implementada / pendiente de validación visual en navegador | Current `ui.html` and `style.css` add a global request loader wired through the centralized `api()` helper, with concurrent request counting and accessible busy state. |
| US-127 | Implementada / pendiente de validación visual en navegador | Current `ui.html` derives richer inventory and spell descriptions/tags from existing catalog fields, keeps tags emoji-free, and exposes weapon/armor/ammunition rule attributes in inventory and creation cards. |
| US-128 | Implementada / pendiente de validación visual en navegador | Current `ui.html` and `style.css` add the Figma `Lanzar Dado` attack path: weapon list, d20 roll, ammunition decrement, remaining-unit display, critical/fumble states, success/failure confirmation, damage roll, and sheet refresh. |
| US-129 | Implementada / pendiente de validación visual en navegador | Current `ui.html` and `style.css` add the Figma spell dice path: cantrip/spell tabs, slot summary, spell cards, dice selector, slot consumption for leveled spells, result screen, and save-DC instruction copy. |
| US-130 | Implementada / pendiente de validación visual en navegador | Current `ui.html` and `style.css` animate virtual dice rolls for attack, damage, spell, custom, and consumable flows, with disabled buttons during rolling and reduced-motion CSS fallback. |
| US-131 | Implementada / pendiente de validación visual en navegador | Current `ui.html` calculates weapon attack totals with ability modifier plus proficiency only when the character is proficient with that weapon, and current `style.css`/`ui.html` show proficiency badges and summaries for skills, saving throws, weapons, armor, shields, tools, and item-related proficiencies. |
| US-132 | Implementada / pendiente de migración en base remota y validación E2E | Current backend adds `User`, `/auth/register`, `/auth/login`, `/auth/me`, optional bearer auth, owner guard for character subroutes, profile-filtered roster, scrypt+pepper password hashing, legacy PBKDF2 verification, production `AUTH_SECRET` guard, and minimal token payload. Current `ui.html` adds login/register/logout and sends tokens through `api()`. Migration file exists; applying it to Supabase remoto es pendiente por restricción de red del entorno. |
| US-133 | Implementada / pendiente de configuración real en GitHub | Current repo adds `.gitignore` hardening, `.env.example`, public `config.public.js`, `index.html`, `.nojekyll`, `README.md`, `SECURITY.md`, GitHub Pages workflow, and `npm run prepublish:check`. Runtime Figma MCP asset URLs were removed from UI/CSS. Validated with `npm run prepublish:check`. |
| US-134 | Implementada / pendiente de despliegue real | Current backend has env-based production CORS, Render blueprint `render.yaml`, build/migrate/start scripts, safe env placeholders, and `/health`. Validated locally with typecheck, tests, build, and security check. Pending: create Render service and update `config.public.js` with the backend HTTPS URL. |
| US-135 | Implementada / pendiente de validación visual en navegador | Current `ui.html` groups race cards by inferred parent/family order, keeps elf variants adjacent, leaves tiefling subraces as catalog-supported/pending validation, and moves Point Buy attributes into the late creation phase before skills/conjuros and HP. Current `style.css` adds family section styling. |
| US-136 | Implementada / pendiente de validación visual en navegador | Current `ui.html` suggests valid Point Buy distributions based on class priority, background hint, and racial bonuses; users can apply the suggested base scores while preserving the no-double-racial-bonus contract. |
| US-137 | Implementada parcial / pendiente de validación visual y modelo de monedas/alijo | Current `ui.html` and `style.css` add Figma-style `Equipo`, `Mochila`, `Alijo`, equipped-slot cards, dashed empty states, add-object search/filter/list flow, and quantity confirmation. Coin persistence and true storage locations remain pending backend modeling. |
| US-138 | Implementada / pendiente de validación visual en navegador | Current `ui.html` adds `renderInventoryCarryCard()` with SVG bag/coin icons, progress bar, and PO/PP/PC columns in the Mochila tab. Weight is derived from the hydration engine (`h.carriedWeight`, `h.carryingCapacity`). Coin values read directly from the character record (`gp`, `sp`, `cp`). |
| US-139 | Implementada / pendiente de validación visual con personaje armado | Current `character.repository.ts` adds `buildRawCharacter()` translating Prisma output to `RawCharacter`; current `character.controller.ts` `/hydrated` endpoint replaces ~120 lines of manual calculation with `buildRawCharacter()` + `hydrate()`. AC now uses equipped armor category, speed includes heavy-armor penalty, stealth disadvantage badge is shown, HP uses `level_1_hp_roll`, and encumbrance is included in the response. TypeCheck: 0 errors. Tests: 77/77 passing. |
| US-140 | Implementada / pendiente de validación visual en navegador | Current `ui.html` and `style.css` add the full Figma-matched "Resolución de historia" dice flow: skill picker with all 18 skills and computed bonuses, automatic advantage/disadvantage detection (stealth + armor, active conditions), dual-die display with loser dimmed, and final result = winning die + skill modifier. `openStoryResolutionFlow`, `renderStoryResolutionSkills`, `renderStoryResolutionRoll`, `rollStoryDice` added. Verified with `node --check`. |
| US-141 | Implementada / pendiente de validación visual en navegador | Current `ui.html` expands `ITEM_NAME_ES` to 257 items and `SPELL_NAME_ES` to cover all 410 SRD spells across levels 0-9. Four spell render sites in the character sheet now pass names through the translation map before display. Backend names unchanged — all lookups continue to work in English. |
| US-142 | Implementada | Current `ui.html` loads `@dice-roller/rpg-dice-roller@5` from jsDelivr CDN and uses it as the RNG/parser engine inside `rollDiceFormula()`. Return contract `{ rolls, bonus, total }` is preserved; all DnD modifier stacking (ability mod, proficiency, skill bonuses, penalties) is unchanged. Automatic fallback to manual RNG if CDN unavailable. |

### US-142: rpg-dice-roller Integration

**Goal:** Replace the custom regex RNG in `rollDiceFormula()` with the industry-standard `@dice-roller/rpg-dice-roller` library, enabling richer dice notation and a reproducible, well-tested engine — without touching any of the DnD modifier layers.

**Acceptance criteria:**
- Library loaded from CDN in `<head>`; no npm build step required for the UI.
- `rollDiceFormula('2d6+3')` returns `{ rolls: [n1, n2], bonus: 3, total: n1+n2+3 }`.
- All existing call sites (`rollAttackDamage`, `rollSpellDie`, `rollGenericDice`, `rollUseItemDice`) behave identically from the consumer's perspective.
- If the CDN script fails to load, the page degrades silently to the manual fallback.
- `parseDiceFormula()` unchanged — still used by `diceFormulaSides()`.

### US-143: Dados 3D con Three.js

**Goal:** Reemplazar la animación CSS de dados con dados 3D reales renderizados en WebGL usando Three.js, mostrando la geometría correcta para cada tipo (d4–d100) al momento de lanzar.

**Acceptance criteria:**
- Three.js r128 cargado desde cdnjs CDN; sin dependencias npm adicionales.
- Al lanzar cualquier dado aparece overlay a pantalla completa con el dado 3D girando ~1.1s.
- Cada tipo de dado usa su geometría correcta: tetraedro, cubo, octaedro, pirámide pentagonal, dodecaedro, icosaedro, esfera.
- Cada dado tiene color y líneas de aristas diferenciados por tipo.
- Si Three.js no carga (sin conexión), `animateDiceResult` cae automáticamente al CSS sin errores.
- Toda la lógica DnD (modificadores, proficiencia, ventaja/desventaja) permanece sin cambios.
- `sidesToDieClass(sides)` mapea número de caras a clase CSS correcta en toda la UI.

| US | Estado | Notas |
|----|--------|-------|
| US-143 | Implementada / pendiente de validación visual en navegador | Three.js r128 desde cdnjs. `dice3D` IIFE con `setup()` + `rollDie(sides)`. Overlay `#dice-3d-overlay` z-index 10000. Fallback CSS automático. |

### US-144: Thrown Weapon Mode Selection

**Goal:** Let players choose whether a thrown weapon is used in melee or thrown before rolling, so range, context and inventory quantity are handled correctly.

**Acceptance criteria:**
- A thrown weapon selected in the attack flow must show an intermediate choice between melee use and thrown use.
- Melee mode must use standard 5 ft melee context.
- Thrown mode must show the weapon's short and long range when available.
- The attack roll screen must show the chosen mode.
- If the player chooses thrown mode, one unit of that weapon must be deducted from inventory when the d20 is rolled.
- The attack roll screen must show remaining quantity before the throw.
- Back navigation from the roll screen must return to the mode selection step.

| US | Estado | Notas |
|----|--------|-------|
| US-144 | Implementada / pendiente de validación visual en navegador | Documentado en `docs/behavioral_design.md`; el flujo descuenta una unidad solo cuando el arma se lanza. |

### US-145: Visual Identity for Inventory Items

**Goal:** Give each inventory item a recognizable visual identity without relying on generic SVG category icons, so players can identify items quickly while preserving clean textual attributes.

**Acceptance criteria:**
- The inventory, add-item catalog and quantity confirmation screen must use the same approved visual identity system once reimplemented.
- The solution must not use the reverted generic inline SVG icon set.
- The selected approach must support unique item images or another user-approved visual system.
- Item rarity, source and item type must remain visible as clean textual attributes without decorative emojis in tags.
- Item descriptions must continue to prefer the database `description` field when available.

| US | Estado | Notas |
|----|--------|-------|
| US-145 | En progreso / implementación parcial con assets locales + Game-icons | A temporary implementation with 34 inline SVG symbols was added and then rolled back on 2026-05-09 by product decision. Current `ui.html` uses local image assets from `src/images/items` first, then Game-icons via Iconify as category/subtype fallback, with rarity-based colors. Pending: validate visual QA in browser and external Iconify loading in production. |

### US-146: New Style Template UI from Figma

**Goal:** Re-skin the main player-facing mobile UI using the Figma `New-style` / `pantallas template` section, applying the parchment fantasy visual system without breaking existing character, inventory, dice, auth, and API flows.

**Acceptance criteria:**
- The roster/home screen uses the new parchment page background, red welcome heading, Figma bottom navigation order, Figma character card hierarchy, and full-width red add-character CTA.
- The opened-character screen uses the `ficha bg` background, Figma header, bottom character navigation, parchment detail card, visible CA, Velocidad and Bonificador de competencia, XP/level block, character image, attributes, magic stats, and HP adjustment block.
- The inventory screen uses Figma tabs (`Equipo`, `Mochila`, `Alijo`), the `Carga`/coin card, parchment item cards, dashed empty equipment slots, and the established local-image/Game-icons visual identity for item art.
- The New Style UI layer must expose Figma-derived CSS tokens for colors, typography, spacing, sizing, radii, shadows, and image/background assets instead of scattering raw values across components.
- Inventory item cards must follow the annotated card spec: quantity pill, item name, item type, collapsible affordance, attributes/damage separated by commas, price/weight row, description, and actions.
- Consumable items must show `Usar` instead of `Equipar`; equipable items must show equip/desequip action; cards must expose delete/sell actions without breaking inventory flows.
- Tapping an inventory item card must open the Figma-style `Descripción` drawer with item art, name, type/rarity, value, rule highlights, metadata, and full description.
- Existing data flows must remain intact: character opening, image upload, inventory equip/use, dice flows, spell/skill tabs, and API calls.
- Any visual approximation or missing Figma screen must be marked as pending visual QA rather than treated as a 100% match.

| US | Estado | Notas |
|----|--------|-------|
| US-146 | En progreso / pendiente de validación visual en navegador | Current `ui.html` and `style.css` add the first New Style template pass for home, opened character, inventory templates, Figma-derived CSS tokens, and the inventory item `Descripción` drawer using `src/images/page bg.png`, `src/images/ficha bg.png`, and `src/images/dnd_card_bg.png`. JS syntax and TypeScript validation pass. Pending: browser QA against Figma node `2086:824` and remaining modal/detail screens. |

*End of requirements.md — Total User Stories: US-01 through US-146.*
