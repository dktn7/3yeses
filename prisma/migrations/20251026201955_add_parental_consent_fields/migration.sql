-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "parentConsentToken" TEXT,
ADD COLUMN     "parentConsentTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "parentConsentedAt" TIMESTAMP(3),
ADD COLUMN     "parentEmail" TEXT,
ADD COLUMN     "parentName" TEXT,
ADD COLUMN     "parentalConsentGiven" BOOLEAN DEFAULT false,
ADD COLUMN     "parentalConsentPending" BOOLEAN DEFAULT false,
ADD COLUMN     "parentalConsentRequired" BOOLEAN DEFAULT false;
