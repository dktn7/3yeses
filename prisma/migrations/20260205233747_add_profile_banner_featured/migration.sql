-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('PROFILE_VIEW', 'PROFILE_COMMENT', 'PROFILE_LIKE', 'MESSAGE', 'SYSTEM');

-- AlterTable
ALTER TABLE "public"."PortfolioItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."TalentProfile" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "featuredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "public"."WorkHistory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "talentProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "talentProfileId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_talentProfileId_createdAt_idx" ON "public"."Notification"("talentProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_talentProfileId_read_dismissed_idx" ON "public"."Notification"("talentProfileId", "read", "dismissed");

-- CreateIndex
CREATE INDEX "PortfolioItem_type_idx" ON "public"."PortfolioItem"("type");

-- CreateIndex
CREATE INDEX "PortfolioItem_talentProfileId_idx" ON "public"."PortfolioItem"("talentProfileId");

-- CreateIndex
CREATE INDEX "PortfolioItem_createdAt_idx" ON "public"."PortfolioItem"("createdAt");

-- CreateIndex
CREATE INDEX "TalentProfile_categoryId_idx" ON "public"."TalentProfile"("categoryId");

-- CreateIndex
CREATE INDEX "TalentProfile_subcategoryId_idx" ON "public"."TalentProfile"("subcategoryId");

-- CreateIndex
CREATE INDEX "TalentProfile_userId_idx" ON "public"."TalentProfile"("userId");

-- CreateIndex
CREATE INDEX "TalentProfile_gender_idx" ON "public"."TalentProfile"("gender");

-- CreateIndex
CREATE INDEX "TalentProfile_ethnicity_idx" ON "public"."TalentProfile"("ethnicity");

-- CreateIndex
CREATE INDEX "TalentProfile_bodyType_idx" ON "public"."TalentProfile"("bodyType");

-- CreateIndex
CREATE INDEX "TalentProfile_age_idx" ON "public"."TalentProfile"("age");

-- CreateIndex
CREATE INDEX "TalentProfile_height_idx" ON "public"."TalentProfile"("height");

-- CreateIndex
CREATE INDEX "TalentProfile_location_idx" ON "public"."TalentProfile"("location");

-- CreateIndex
CREATE INDEX "TalentProfile_rating_idx" ON "public"."TalentProfile"("rating");

-- CreateIndex
CREATE INDEX "TalentProfile_viewCount_idx" ON "public"."TalentProfile"("viewCount");

-- CreateIndex
CREATE INDEX "TalentProfile_createdAt_idx" ON "public"."TalentProfile"("createdAt");

-- CreateIndex
CREATE INDEX "TalentProfile_skills_idx" ON "public"."TalentProfile"("skills");

-- AddForeignKey
ALTER TABLE "public"."WorkHistory" ADD CONSTRAINT "WorkHistory_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
