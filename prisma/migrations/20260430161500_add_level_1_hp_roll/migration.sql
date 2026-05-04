-- Add rolled hit die base for level-1 HP from the creation wizard.
ALTER TABLE "Character"
ADD COLUMN "level_1_hp_roll" INTEGER;
