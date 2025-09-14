/*
  Warnings:

  - The values [AVERAGE] on the enum `BodyType` will be removed. If these variants are still used in the database, this will fail.
  - The values [OTHER] on the enum `Gender` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ProfileVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'CONTACTS_ONLY');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."BodyType_new" AS ENUM ('SLIM', 'ATHLETIC', 'CURVY', 'PLUS_SIZE', 'MUSCULAR');
ALTER TABLE "public"."TalentProfile" ALTER COLUMN "bodyType" TYPE "public"."BodyType_new" USING ("bodyType"::text::"public"."BodyType_new");
ALTER TYPE "public"."BodyType" RENAME TO "BodyType_old";
ALTER TYPE "public"."BodyType_new" RENAME TO "BodyType";
DROP TYPE "public"."BodyType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Gender_new" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY');
ALTER TABLE "public"."TalentProfile" ALTER COLUMN "gender" TYPE "public"."Gender_new" USING ("gender"::text::"public"."Gender_new");
ALTER TYPE "public"."Gender" RENAME TO "Gender_old";
ALTER TYPE "public"."Gender_new" RENAME TO "Gender";
DROP TYPE "public"."Gender_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."PortfolioItemType" ADD VALUE 'DOCUMENT';
ALTER TYPE "public"."PortfolioItemType" ADD VALUE 'LINK';

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropTable
DROP TABLE "public"."Message";

-- CreateTable
CREATE TABLE "public"."ProfileSettings" (
    "id" TEXT NOT NULL,
    "talentProfileId" TEXT NOT NULL,
    "showViewCount" BOOLEAN NOT NULL DEFAULT true,
    "showExperienceLevel" BOOLEAN NOT NULL DEFAULT true,
    "showLocation" BOOLEAN NOT NULL DEFAULT true,
    "showLanguages" BOOLEAN NOT NULL DEFAULT true,
    "showAvailability" BOOLEAN NOT NULL DEFAULT true,
    "showRating" BOOLEAN NOT NULL DEFAULT true,
    "showReviewCount" BOOLEAN NOT NULL DEFAULT true,
    "showWorkHistory" BOOLEAN NOT NULL DEFAULT true,
    "showSocialMedia" BOOLEAN NOT NULL DEFAULT true,
    "showContactInfo" BOOLEAN NOT NULL DEFAULT true,
    "profileVisibility" "public"."ProfileVisibility" NOT NULL DEFAULT 'PUBLIC',
    "searchable" BOOLEAN NOT NULL DEFAULT true,
    "allowDirectContact" BOOLEAN NOT NULL DEFAULT true,
    "showOnlineStatus" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileSettings_talentProfileId_key" ON "public"."ProfileSettings"("talentProfileId");

-- AddForeignKey
ALTER TABLE "public"."ProfileSettings" ADD CONSTRAINT "ProfileSettings_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
