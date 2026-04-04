-- CreateEnum
CREATE TYPE "public"."EmailStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'SPAM_COMPLAINT');

-- CreateEnum
CREATE TYPE "public"."MetricType" AS ENUM ('API_REQUEST', 'DB_QUERY', 'ERROR_LOG', 'SYSTEM_HEALTH');

-- CreateEnum
CREATE TYPE "public"."GlobalNotificationType" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "public"."UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "path" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "templateId" TEXT,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "status" "public"."EmailStatus" NOT NULL DEFAULT 'SENT',
    "error" TEXT,
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemMetric" (
    "id" TEXT NOT NULL,
    "type" "public"."MetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "name" TEXT NOT NULL,
    "tags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentPage" (
    "slug" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ContentPage_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "public"."PublishedContent" (
    "id" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,

    CONSTRAINT "PublishedContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentVersion" (
    "id" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "changelog" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" TEXT[],
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GlobalNotification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "public"."GlobalNotificationType" NOT NULL,
    "targetRole" "public"."Role",
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlobalNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "public"."UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_startedAt_idx" ON "public"."UserSession"("startedAt");

-- CreateIndex
CREATE INDEX "UserSession_ipAddress_idx" ON "public"."UserSession"("ipAddress");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "public"."ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "public"."ActivityLog"("action");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "public"."ActivityLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailLog_providerMessageId_key" ON "public"."EmailLog"("providerMessageId");

-- CreateIndex
CREATE INDEX "EmailLog_userId_idx" ON "public"."EmailLog"("userId");

-- CreateIndex
CREATE INDEX "EmailLog_type_idx" ON "public"."EmailLog"("type");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "public"."EmailLog"("status");

-- CreateIndex
CREATE INDEX "EmailLog_providerMessageId_idx" ON "public"."EmailLog"("providerMessageId");

-- CreateIndex
CREATE INDEX "EmailLog_createdAt_idx" ON "public"."EmailLog"("createdAt");

-- CreateIndex
CREATE INDEX "SystemMetric_type_createdAt_idx" ON "public"."SystemMetric"("type", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PublishedContent_pageSlug_locale_key" ON "public"."PublishedContent"("pageSlug", "locale");

-- AddForeignKey
ALTER TABLE "public"."UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailLog" ADD CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublishedContent" ADD CONSTRAINT "PublishedContent_pageSlug_fkey" FOREIGN KEY ("pageSlug") REFERENCES "public"."ContentPage"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublishedContent" ADD CONSTRAINT "PublishedContent_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "public"."ContentVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentVersion" ADD CONSTRAINT "ContentVersion_pageSlug_fkey" FOREIGN KEY ("pageSlug") REFERENCES "public"."ContentPage"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentVersion" ADD CONSTRAINT "ContentVersion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
