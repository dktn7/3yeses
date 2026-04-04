-- Migration: remove-ratings-reviews
-- Auto-generated wrapper around manual SQL to drop Review and rating fields
BEGIN;

-- Drop Review table if it still exists
DROP TABLE IF EXISTS "Review" CASCADE;

-- Remove rating column from TalentProfile (if present)
ALTER TABLE IF EXISTS "TalentProfile" DROP COLUMN IF EXISTS "rating";

-- Remove showRating / showReviewCount from ProfileSettings (if present)
ALTER TABLE IF EXISTS "ProfileSettings" DROP COLUMN IF EXISTS "showRating";
ALTER TABLE IF EXISTS "ProfileSettings" DROP COLUMN IF EXISTS "showReviewCount";

COMMIT;

-- To mark this migration as applied by Prisma without running, you can run
-- `npx prisma migrate resolve --applied 20260208_remove-ratings-reviews`
-- after ensuring the SQL was executed against the database.
