-- Remove ratings and reviews (manual migration)
-- Run this script against your development database to drop the Review
-- table and remove rating-related columns. This is non-reversible; back up
-- your data before applying.

BEGIN;

-- Drop Review table if it still exists
DROP TABLE IF EXISTS "Review" CASCADE;

-- Remove rating column from TalentProfile (if present)
ALTER TABLE "TalentProfile" DROP COLUMN IF EXISTS "rating";

-- Remove showRating / showReviewCount from ProfileSettings (if present)
ALTER TABLE "ProfileSettings" DROP COLUMN IF EXISTS "showRating";
ALTER TABLE "ProfileSettings" DROP COLUMN IF EXISTS "showReviewCount";

COMMIT;

-- Notes:
-- - Apply with psql or your DB management tool connected to the correct schema.
-- - After applying, run `npx prisma generate` so the Prisma client matches the
--   schema file. If you want Prisma Migrate to record this as a migration, you
--   can place this SQL into a new folder under `prisma/migrations/<timestamp>_remove-ratings-reviews/migration.sql`.
