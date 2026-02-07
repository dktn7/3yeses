-- AlterEnum
ALTER TYPE "public"."BodyType" ADD VALUE 'PREFER_NOT_TO_SAY';

-- AlterTable
ALTER TABLE "public"."TalentProfile" ADD COLUMN     "disabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "disabilityOther" TEXT;
