-- Add the persisted pin state used by comment ordering and the pin/unpin API.
ALTER TABLE "public"."Comment"
  ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "pinnedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Comment_isPinned_createdAt_idx"
  ON "public"."Comment"("isPinned", "createdAt");
