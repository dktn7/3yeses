/*
  Warnings:

  - You are about to drop the column `showAvailability` on the `ProfileSettings` table. All the data in the column will be lost.
  - You are about to drop the column `availability` on the `TalentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `ratePerHour` on the `TalentProfile` table. All the data in the column will be lost.
  - You are about to drop the `ClientProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubSubcategory` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `experience` on table `TalentProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."ClientProfile" DROP CONSTRAINT "ClientProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SubSubcategory" DROP CONSTRAINT "SubSubcategory_subcategoryId_fkey";

-- AlterTable
ALTER TABLE "public"."ProfileSettings" DROP COLUMN "showAvailability";

-- AlterTable
ALTER TABLE "public"."TalentProfile" DROP COLUMN "availability",
DROP COLUMN "ratePerHour",
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "experience" SET NOT NULL,
ALTER COLUMN "languages" SET DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "public"."ClientProfile";

-- DropTable
DROP TABLE "public"."SubSubcategory";

-- DropEnum
DROP TYPE "public"."Availability";

-- CreateTable
CREATE TABLE "public"."Like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "talentProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_talentProfileId_key" ON "public"."Like"("userId", "talentProfileId");

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
