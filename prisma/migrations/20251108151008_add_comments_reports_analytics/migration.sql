-- CreateEnum
CREATE TYPE "public"."CommentStatus" AS ENUM ('APPROVED', 'PENDING', 'FLAGGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."ReportType" AS ENUM ('SPAM', 'INAPPROPRIATE_CONTENT', 'HARASSMENT', 'FAKE_PROFILE', 'COPYRIGHT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "public"."CommentStatus" NOT NULL DEFAULT 'APPROVED',
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "portfolioItemId" TEXT,
    "talentProfileId" TEXT,
    "parentCommentId" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommentLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    CONSTRAINT "CommentLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" TEXT NOT NULL,
    "type" "public"."ReportType" NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedUserId" TEXT,
    "reportedProfileId" TEXT,
    "reportedCommentId" TEXT,
    "reportedPortfolioId" TEXT,
    "handledById" TEXT,
    "handledAt" TIMESTAMP(3),
    "adminNotes" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProfileView" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewerId" TEXT,
    "talentProfileId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "duration" INTEGER,

    CONSTRAINT "ProfileView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PortfolioView" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewerId" TEXT,
    "portfolioItemId" TEXT NOT NULL,
    "duration" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PortfolioView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SearchAppearance" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "searchQuery" TEXT NOT NULL,
    "searchFilters" JSONB,
    "talentProfileId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "clicked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SearchAppearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProfileStats" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "talentProfileId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "profileLikes" INTEGER NOT NULL DEFAULT 0,
    "portfolioViews" INTEGER NOT NULL DEFAULT 0,
    "searchImpressions" INTEGER NOT NULL DEFAULT 0,
    "searchClicks" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProfileStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "public"."Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_portfolioItemId_idx" ON "public"."Comment"("portfolioItemId");

-- CreateIndex
CREATE INDEX "Comment_talentProfileId_idx" ON "public"."Comment"("talentProfileId");

-- CreateIndex
CREATE INDEX "Comment_parentCommentId_idx" ON "public"."Comment"("parentCommentId");

-- CreateIndex
CREATE INDEX "Comment_status_idx" ON "public"."Comment"("status");

-- CreateIndex
CREATE INDEX "CommentLike_userId_idx" ON "public"."CommentLike"("userId");

-- CreateIndex
CREATE INDEX "CommentLike_commentId_idx" ON "public"."CommentLike"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentLike_userId_commentId_key" ON "public"."CommentLike"("userId", "commentId");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "public"."Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_reportedUserId_idx" ON "public"."Report"("reportedUserId");

-- CreateIndex
CREATE INDEX "Report_reportedProfileId_idx" ON "public"."Report"("reportedProfileId");

-- CreateIndex
CREATE INDEX "Report_reportedCommentId_idx" ON "public"."Report"("reportedCommentId");

-- CreateIndex
CREATE INDEX "Report_reportedPortfolioId_idx" ON "public"."Report"("reportedPortfolioId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "public"."Report"("status");

-- CreateIndex
CREATE INDEX "Report_type_idx" ON "public"."Report"("type");

-- CreateIndex
CREATE INDEX "ProfileView_talentProfileId_idx" ON "public"."ProfileView"("talentProfileId");

-- CreateIndex
CREATE INDEX "ProfileView_viewerId_idx" ON "public"."ProfileView"("viewerId");

-- CreateIndex
CREATE INDEX "ProfileView_createdAt_idx" ON "public"."ProfileView"("createdAt");

-- CreateIndex
CREATE INDEX "PortfolioView_portfolioItemId_idx" ON "public"."PortfolioView"("portfolioItemId");

-- CreateIndex
CREATE INDEX "PortfolioView_viewerId_idx" ON "public"."PortfolioView"("viewerId");

-- CreateIndex
CREATE INDEX "PortfolioView_createdAt_idx" ON "public"."PortfolioView"("createdAt");

-- CreateIndex
CREATE INDEX "SearchAppearance_talentProfileId_idx" ON "public"."SearchAppearance"("talentProfileId");

-- CreateIndex
CREATE INDEX "SearchAppearance_createdAt_idx" ON "public"."SearchAppearance"("createdAt");

-- CreateIndex
CREATE INDEX "SearchAppearance_searchQuery_idx" ON "public"."SearchAppearance"("searchQuery");

-- CreateIndex
CREATE INDEX "ProfileStats_talentProfileId_idx" ON "public"."ProfileStats"("talentProfileId");

-- CreateIndex
CREATE INDEX "ProfileStats_date_idx" ON "public"."ProfileStats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileStats_talentProfileId_date_key" ON "public"."ProfileStats"("talentProfileId", "date");

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_portfolioItemId_fkey" FOREIGN KEY ("portfolioItemId") REFERENCES "public"."PortfolioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "public"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentLike" ADD CONSTRAINT "CommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentLike" ADD CONSTRAINT "CommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reportedProfileId_fkey" FOREIGN KEY ("reportedProfileId") REFERENCES "public"."TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reportedCommentId_fkey" FOREIGN KEY ("reportedCommentId") REFERENCES "public"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reportedPortfolioId_fkey" FOREIGN KEY ("reportedPortfolioId") REFERENCES "public"."PortfolioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfileView" ADD CONSTRAINT "ProfileView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfileView" ADD CONSTRAINT "ProfileView_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortfolioView" ADD CONSTRAINT "PortfolioView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortfolioView" ADD CONSTRAINT "PortfolioView_portfolioItemId_fkey" FOREIGN KEY ("portfolioItemId") REFERENCES "public"."PortfolioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SearchAppearance" ADD CONSTRAINT "SearchAppearance_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfileStats" ADD CONSTRAINT "ProfileStats_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "public"."TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
