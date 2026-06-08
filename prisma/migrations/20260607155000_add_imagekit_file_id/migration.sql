-- Add missing imagekitFileId column to PortfolioItem
ALTER TABLE "PortfolioItem"
ADD COLUMN IF NOT EXISTS "imagekitFileId" TEXT;
