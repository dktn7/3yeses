-- CreateEnum
CREATE TYPE "public"."AdPosition" AS ENUM ('HEADER', 'SIDEBAR', 'FOOTER', 'FEED', 'HERO');

-- CreateTable
CREATE TABLE "public"."AdBanner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "position" "public"."AdPosition" NOT NULL DEFAULT 'SIDEBAR',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeaturedItem" (
    "id" TEXT NOT NULL,
    "talentProfileId" TEXT,
    "portfolioItemId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "slot" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdBanner_position_active_idx" ON "public"."AdBanner"("position", "active");

-- CreateIndex
CREATE INDEX "AdBanner_startDate_endDate_idx" ON "public"."AdBanner"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "FeaturedItem_slot_active_idx" ON "public"."FeaturedItem"("slot", "active");

-- CreateIndex
CREATE INDEX "FeaturedItem_priority_idx" ON "public"."FeaturedItem"("priority");

-- AddForeignKey
ALTER TABLE "public"."FeaturedItem" ADD CONSTRAINT "FeaturedItem_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeaturedItem" ADD CONSTRAINT "FeaturedItem_portfolioItemId_fkey" FOREIGN KEY ("portfolioItemId") REFERENCES "public"."PortfolioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
