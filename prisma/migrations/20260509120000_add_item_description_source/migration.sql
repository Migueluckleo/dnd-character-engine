-- Migration: add_item_description_source
-- US-127: Add description and source fields to Item model
-- Date: 2026-05-09

ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'srd';
