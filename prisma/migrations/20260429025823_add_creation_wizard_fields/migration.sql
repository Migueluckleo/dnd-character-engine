-- AlterTable
ALTER TABLE "Background" ADD COLUMN     "feature_description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "feature_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "roleplay_data" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "starting_equipment" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "background_variant" TEXT,
ADD COLUMN     "bonds" TEXT,
ADD COLUMN     "flaws" TEXT,
ADD COLUMN     "ideals" TEXT,
ADD COLUMN     "personality_traits" TEXT;

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "spellcasting_ability" TEXT,
ADD COLUMN     "starting_cantrip_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "starting_skill_choices" JSONB NOT NULL DEFAULT '{"count":2,"pool":null}',
ADD COLUMN     "starting_spells_known" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subclass_level" INTEGER;
