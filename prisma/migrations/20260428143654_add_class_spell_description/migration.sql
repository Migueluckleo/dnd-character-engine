-- AlterTable
ALTER TABLE "Spell" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "ClassSpell" (
    "class_id" TEXT NOT NULL,
    "spell_id" TEXT NOT NULL,

    CONSTRAINT "ClassSpell_pkey" PRIMARY KEY ("class_id","spell_id")
);

-- AddForeignKey
ALTER TABLE "ClassSpell" ADD CONSTRAINT "ClassSpell_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSpell" ADD CONSTRAINT "ClassSpell_spell_id_fkey" FOREIGN KEY ("spell_id") REFERENCES "Spell"("spell_id") ON DELETE RESTRICT ON UPDATE CASCADE;
