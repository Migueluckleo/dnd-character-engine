-- CreateEnum
CREATE TYPE "Size" AS ENUM ('tiny', 'small', 'medium', 'large');

-- CreateEnum
CREATE TYPE "ArmorCategory" AS ENUM ('light', 'medium', 'heavy', 'shield');

-- CreateEnum
CREATE TYPE "CasterType" AS ENUM ('full', 'half', 'warlock', 'none');

-- CreateEnum
CREATE TYPE "SlotSource" AS ENUM ('standard', 'pact_magic');

-- CreateEnum
CREATE TYPE "RestRecovery" AS ENUM ('short_rest', 'long_rest');

-- CreateEnum
CREATE TYPE "LanguageType" AS ENUM ('standard', 'exotic');

-- CreateEnum
CREATE TYPE "Alignment" AS ENUM ('lawful_good', 'neutral_good', 'chaotic_good', 'lawful_neutral', 'true_neutral', 'chaotic_neutral', 'lawful_evil', 'neutral_evil', 'chaotic_evil', 'unaligned');

-- CreateTable
CREATE TABLE "Race" (
    "race_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_race_id" TEXT,
    "size" "Size" NOT NULL,
    "base_speed" INTEGER NOT NULL,
    "ability_bonuses" JSONB NOT NULL,
    "darkvision_radius" INTEGER NOT NULL DEFAULT 0,
    "languages" JSONB NOT NULL DEFAULT '[]',
    "language_choices" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Race_pkey" PRIMARY KEY ("race_id")
);

-- CreateTable
CREATE TABLE "Class" (
    "class_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hit_die" INTEGER NOT NULL,
    "caster_type" "CasterType" NOT NULL,
    "saving_throws" JSONB NOT NULL,
    "starting_proficiencies" JSONB NOT NULL,
    "multiclass_proficiencies" JSONB NOT NULL,
    "multiclass_prerequisites" JSONB NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("class_id")
);

-- CreateTable
CREATE TABLE "Subclass" (
    "subclass_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unlock_level" INTEGER NOT NULL,

    CONSTRAINT "Subclass_pkey" PRIMARY KEY ("subclass_id")
);

-- CreateTable
CREATE TABLE "Background" (
    "background_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "starting_gold" INTEGER NOT NULL,
    "skill_proficiencies" JSONB NOT NULL,
    "tool_proficiencies" JSONB NOT NULL,
    "language_grants" JSONB NOT NULL DEFAULT '[]',
    "language_choices" INTEGER NOT NULL DEFAULT 0,
    "variant_rules" JSONB,

    CONSTRAINT "Background_pkey" PRIMARY KEY ("background_id")
);

-- CreateTable
CREATE TABLE "Trait" (
    "trait_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "effects" JSONB NOT NULL,

    CONSTRAINT "Trait_pkey" PRIMARY KEY ("trait_id")
);

-- CreateTable
CREATE TABLE "RaceTrait" (
    "race_id" TEXT NOT NULL,
    "trait_id" TEXT NOT NULL,

    CONSTRAINT "RaceTrait_pkey" PRIMARY KEY ("race_id","trait_id")
);

-- CreateTable
CREATE TABLE "Item" (
    "item_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost_gp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "armor_category" "ArmorCategory",
    "ac_base" INTEGER,
    "strength_requirement" INTEGER,
    "stealth_disadvantage" BOOLEAN NOT NULL DEFAULT false,
    "damage_dice" TEXT,
    "damage_type" TEXT,
    "properties" JSONB,
    "pack_contents" JSONB,
    "requires_attunement" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "Spell" (
    "spell_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "school" TEXT NOT NULL,
    "casting_time" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "range_ft" TEXT NOT NULL,
    "requires_concentration" BOOLEAN NOT NULL DEFAULT false,
    "spellcasting_ability" TEXT,
    "components" TEXT NOT NULL,
    "effects" JSONB,

    CONSTRAINT "Spell_pkey" PRIMARY KEY ("spell_id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "feature_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level_acquired" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "resource_cost" JSONB,
    "reset_on" "RestRecovery",

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("feature_id")
);

-- CreateTable
CREATE TABLE "Language" (
    "language_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language_type" "LanguageType" NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("language_id")
);

-- CreateTable
CREATE TABLE "Feat" (
    "feat_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prerequisite" JSONB,
    "effects" JSONB NOT NULL,
    "repeatable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Feat_pkey" PRIMARY KEY ("feat_id")
);

-- CreateTable
CREATE TABLE "SpellSlotProgression" (
    "class_id" TEXT NOT NULL,
    "class_level" INTEGER NOT NULL,
    "slot_level" INTEGER NOT NULL,
    "max_slots" INTEGER NOT NULL,
    "slot_source" "SlotSource" NOT NULL DEFAULT 'standard',
    "rest_recovery" "RestRecovery" NOT NULL DEFAULT 'long_rest',

    CONSTRAINT "SpellSlotProgression_pkey" PRIMARY KEY ("class_id","class_level","slot_level")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "race_id" TEXT NOT NULL,
    "background_id" TEXT NOT NULL,
    "alignment" "Alignment" NOT NULL DEFAULT 'true_neutral',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "milestone_leveling" BOOLEAN NOT NULL DEFAULT false,
    "level_up_available" BOOLEAN NOT NULL DEFAULT false,
    "base_str" INTEGER NOT NULL DEFAULT 8,
    "base_dex" INTEGER NOT NULL DEFAULT 8,
    "base_con" INTEGER NOT NULL DEFAULT 8,
    "base_int" INTEGER NOT NULL DEFAULT 8,
    "base_wis" INTEGER NOT NULL DEFAULT 8,
    "base_cha" INTEGER NOT NULL DEFAULT 8,
    "current_hp" INTEGER NOT NULL DEFAULT 0,
    "temp_hp" INTEGER NOT NULL DEFAULT 0,
    "is_dead" BOOLEAN NOT NULL DEFAULT false,
    "death_saves_success" INTEGER NOT NULL DEFAULT 0,
    "death_saves_fail" INTEGER NOT NULL DEFAULT 0,
    "active_concentration_spell_id" TEXT,
    "cp" INTEGER NOT NULL DEFAULT 0,
    "sp" INTEGER NOT NULL DEFAULT 0,
    "ep" INTEGER NOT NULL DEFAULT 0,
    "gp" INTEGER NOT NULL DEFAULT 0,
    "pp" INTEGER NOT NULL DEFAULT 0,
    "has_inspiration" BOOLEAN NOT NULL DEFAULT false,
    "base_speed" INTEGER NOT NULL DEFAULT 30,
    "darkvision_radius" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterClass" (
    "character_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "subclass_id" TEXT,
    "class_level" INTEGER NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CharacterClass_pkey" PRIMARY KEY ("character_id","class_id")
);

-- CreateTable
CREATE TABLE "CharacterSkill" (
    "character_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,
    "is_proficient" BOOLEAN NOT NULL DEFAULT false,
    "is_expertise" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CharacterSkill_pkey" PRIMARY KEY ("character_id","skill_id")
);

-- CreateTable
CREATE TABLE "CharacterTool" (
    "character_id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,
    "is_expertise" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CharacterTool_pkey" PRIMARY KEY ("character_id","tool_id")
);

-- CreateTable
CREATE TABLE "CharacterTrait" (
    "character_id" TEXT NOT NULL,
    "trait_id" TEXT NOT NULL,

    CONSTRAINT "CharacterTrait_pkey" PRIMARY KEY ("character_id","trait_id")
);

-- CreateTable
CREATE TABLE "CharacterFeat" (
    "character_id" TEXT NOT NULL,
    "feat_id" TEXT NOT NULL,

    CONSTRAINT "CharacterFeat_pkey" PRIMARY KEY ("character_id","feat_id")
);

-- CreateTable
CREATE TABLE "CharacterLanguage" (
    "character_id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,

    CONSTRAINT "CharacterLanguage_pkey" PRIMARY KEY ("character_id","language_id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "is_equipped" BOOLEAN NOT NULL DEFAULT false,
    "is_attuned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnownSpell" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "spell_id" TEXT NOT NULL,
    "is_prepared" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "KnownSpell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpellSlotTracker" (
    "character_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "slot_level" INTEGER NOT NULL,
    "max_slots" INTEGER NOT NULL,
    "expended_slots" INTEGER NOT NULL DEFAULT 0,
    "slot_source" "SlotSource" NOT NULL DEFAULT 'standard',

    CONSTRAINT "SpellSlotTracker_pkey" PRIMARY KEY ("character_id","class_id","slot_level")
);

-- CreateTable
CREATE TABLE "HitDiceTracker" (
    "character_id" TEXT NOT NULL,
    "die_type" INTEGER NOT NULL,
    "max_dice" INTEGER NOT NULL,
    "expended_dice" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HitDiceTracker_pkey" PRIMARY KEY ("character_id","die_type")
);

-- CreateTable
CREATE TABLE "ResourcePool" (
    "character_id" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "current" INTEGER NOT NULL,
    "max" INTEGER NOT NULL,
    "reset_on" "RestRecovery" NOT NULL,

    CONSTRAINT "ResourcePool_pkey" PRIMARY KEY ("character_id","pool_id")
);

-- CreateTable
CREATE TABLE "ActiveState" (
    "character_id" TEXT NOT NULL,
    "exhaustion_level" INTEGER NOT NULL DEFAULT 0,
    "reaction_available" BOOLEAN NOT NULL DEFAULT true,
    "is_blinded" BOOLEAN NOT NULL DEFAULT false,
    "is_charmed" BOOLEAN NOT NULL DEFAULT false,
    "is_deafened" BOOLEAN NOT NULL DEFAULT false,
    "is_frightened" BOOLEAN NOT NULL DEFAULT false,
    "is_grappled" BOOLEAN NOT NULL DEFAULT false,
    "is_incapacitated" BOOLEAN NOT NULL DEFAULT false,
    "is_invisible" BOOLEAN NOT NULL DEFAULT false,
    "is_paralyzed" BOOLEAN NOT NULL DEFAULT false,
    "is_petrified" BOOLEAN NOT NULL DEFAULT false,
    "is_poisoned" BOOLEAN NOT NULL DEFAULT false,
    "is_prone" BOOLEAN NOT NULL DEFAULT false,
    "is_restrained" BOOLEAN NOT NULL DEFAULT false,
    "is_stunned" BOOLEAN NOT NULL DEFAULT false,
    "is_unconscious" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ActiveState_pkey" PRIMARY KEY ("character_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Race_name_key" ON "Race"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_key" ON "Class"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subclass_class_id_name_key" ON "Subclass"("class_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Background_name_key" ON "Background"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Trait_name_key" ON "Trait"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_key" ON "Item"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Spell_name_key" ON "Spell"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_class_id_name_key" ON "Feature"("class_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Feat_name_key" ON "Feat"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Character_active_concentration_spell_id_key" ON "Character"("active_concentration_spell_id");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_character_id_item_id_key" ON "InventoryItem"("character_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "KnownSpell_character_id_spell_id_key" ON "KnownSpell"("character_id", "spell_id");

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_parent_race_id_fkey" FOREIGN KEY ("parent_race_id") REFERENCES "Race"("race_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subclass" ADD CONSTRAINT "Subclass_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceTrait" ADD CONSTRAINT "RaceTrait_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "Race"("race_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceTrait" ADD CONSTRAINT "RaceTrait_trait_id_fkey" FOREIGN KEY ("trait_id") REFERENCES "Trait"("trait_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpellSlotProgression" ADD CONSTRAINT "SpellSlotProgression_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "Race"("race_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_background_id_fkey" FOREIGN KEY ("background_id") REFERENCES "Background"("background_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_active_concentration_spell_id_fkey" FOREIGN KEY ("active_concentration_spell_id") REFERENCES "KnownSpell"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterClass" ADD CONSTRAINT "CharacterClass_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterClass" ADD CONSTRAINT "CharacterClass_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterClass" ADD CONSTRAINT "CharacterClass_subclass_id_fkey" FOREIGN KEY ("subclass_id") REFERENCES "Subclass"("subclass_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSkill" ADD CONSTRAINT "CharacterSkill_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTool" ADD CONSTRAINT "CharacterTool_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTrait" ADD CONSTRAINT "CharacterTrait_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTrait" ADD CONSTRAINT "CharacterTrait_trait_id_fkey" FOREIGN KEY ("trait_id") REFERENCES "Trait"("trait_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterFeat" ADD CONSTRAINT "CharacterFeat_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterFeat" ADD CONSTRAINT "CharacterFeat_feat_id_fkey" FOREIGN KEY ("feat_id") REFERENCES "Feat"("feat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterLanguage" ADD CONSTRAINT "CharacterLanguage_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterLanguage" ADD CONSTRAINT "CharacterLanguage_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "Language"("language_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnownSpell" ADD CONSTRAINT "KnownSpell_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnownSpell" ADD CONSTRAINT "KnownSpell_spell_id_fkey" FOREIGN KEY ("spell_id") REFERENCES "Spell"("spell_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpellSlotTracker" ADD CONSTRAINT "SpellSlotTracker_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HitDiceTracker" ADD CONSTRAINT "HitDiceTracker_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourcePool" ADD CONSTRAINT "ResourcePool_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveState" ADD CONSTRAINT "ActiveState_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
