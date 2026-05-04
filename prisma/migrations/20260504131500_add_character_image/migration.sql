-- US-118: Persist uploaded character image data after browser-side compression.

ALTER TABLE "Character"
ADD COLUMN "image_data" TEXT;
