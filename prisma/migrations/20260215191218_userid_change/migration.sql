/*
  Warnings:

  - You are about to drop the column `adminNotes` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `handledAt` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `handledById` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `reportedCommentId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `reportedPortfolioId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `reporterId` on the `Report` table. All the data in the column will be lost.
  - The primary key for the `TalentProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `TalentProfile` table. All the data in the column will be lost.
  - Added the required column `reportedById` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Made the column `reportedUserId` on table `Report` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_talentProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Language" DROP CONSTRAINT "Language_talentProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Like" DROP CONSTRAINT "Like_talentProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_talentProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PortfolioItem" DROP CONSTRAINT "PortfolioItem_talentProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProfileSettings" DROP CONSTRAINT "ProfileSettings_talentProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProfileStats" DROP CONSTRAINT "ProfileStats_talentProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProfileView" DROP CONSTRAINT "ProfileView_talentProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_handledById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_reportedCommentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_reportedPortfolioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_reportedProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SearchAppearance" DROP CONSTRAINT "SearchAppearance_talentProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkHistory" DROP CONSTRAINT "WorkHistory_talentProfileId_fkey";

-- DropIndex
DROP INDEX "public"."Report_reportedCommentId_idx";

-- DropIndex
DROP INDEX "public"."Report_reportedPortfolioId_idx";

-- DropIndex
DROP INDEX "public"."Report_reporterId_idx";

-- AlterTable
ALTER TABLE "public"."Report" DROP COLUMN "adminNotes",
DROP COLUMN "description",
DROP COLUMN "handledAt",
DROP COLUMN "handledById",
DROP COLUMN "reportedCommentId",
DROP COLUMN "reportedPortfolioId",
DROP COLUMN "reporterId",
ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "handlerId" TEXT,
ADD COLUMN     "portfolioItemId" TEXT,
ADD COLUMN     "reportedById" TEXT NOT NULL,
ADD COLUMN     "resolution" TEXT,
ALTER COLUMN "reportedUserId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."TalentProfile" DROP CONSTRAINT "TalentProfile_pkey",
DROP COLUMN "id";

-- CreateIndex
CREATE INDEX "Report_reportedById_idx" ON "public"."Report"("reportedById");

-- CreateIndex
CREATE INDEX "Report_portfolioItemId_idx" ON "public"."Report"("portfolioItemId");

-- CreateIndex
CREATE INDEX "Report_commentId_idx" ON "public"."Report"("commentId");

-- CreateIndex
CREATE INDEX "Report_handlerId_idx" ON "public"."Report"("handlerId");

-- AddForeignKey
ALTER TABLE "public"."ProfileSettings" ADD CONSTRAINT "ProfileSettings_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Language" ADD CONSTRAINT "Language_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkHistory" ADD CONSTRAINT "WorkHistory_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortfolioItem" ADD CONSTRAINT "PortfolioItem_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reportedProfileId_fkey" FOREIGN KEY ("reportedProfileId") REFERENCES "public"."TalentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_portfolioItemId_fkey" FOREIGN KEY ("portfolioItemId") REFERENCES "public"."PortfolioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_handlerId_fkey" FOREIGN KEY ("handlerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfileView" ADD CONSTRAINT "ProfileView_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SearchAppearance" ADD CONSTRAINT "SearchAppearance_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfileStats" ADD CONSTRAINT "ProfileStats_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
