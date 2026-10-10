/*
  Repair the live database enum so it matches prisma/schema.prisma.
  The database currently has "public"."Role", while Prisma expects "public"."UserRole".
*/
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'Role'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'UserRole'
  ) THEN
    ALTER TYPE "public"."Role" RENAME TO "UserRole";
  END IF;
END $$;
