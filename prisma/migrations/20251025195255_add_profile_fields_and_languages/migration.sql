/*
  Warnings:

  - You are about to drop the column `languages` on the `TalentProfile` table. All the data in the column will be lost.
  - The `ethnicity` column on the `TalentProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `TalentProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Proficiency" AS ENUM ('NATIVE', 'FLUENT', 'INTERMEDIATE', 'BASIC');

-- CreateEnum
CREATE TYPE "public"."Ethnicity" AS ENUM ('WHITE_CAUCASIAN', 'BLACK_AFRICAN', 'ASIAN', 'HISPANIC_LATINO', 'MIDDLE_EASTERN', 'MIXED_MULTIRACIAL', 'NATIVE_AMERICAN', 'PACIFIC_ISLANDER', 'PREFER_NOT_TO_SAY', 'OTHER');

-- AlterEnum
ALTER TYPE "public"."BodyType" ADD VALUE 'AVERAGE';

-- AlterEnum
ALTER TYPE "public"."Gender" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "public"."TalentProfile" DROP COLUMN "languages",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "ethnicityOther" TEXT,
ADD COLUMN     "genderOther" TEXT,
ADD COLUMN     "portfolioImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "profileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "videoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "experience" DROP NOT NULL,
ALTER COLUMN "experience" SET DATA TYPE TEXT,
DROP COLUMN "ethnicity",
ADD COLUMN     "ethnicity" "public"."Ethnicity";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "verificationTokenExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."Language" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "proficiency" "public"."Proficiency" NOT NULL,
    "talentProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_talentProfileId_name_key" ON "public"."Language"("talentProfileId", "name");

-- AddForeignKey
ALTER TABLE "public"."Language" ADD CONSTRAINT "Language_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
