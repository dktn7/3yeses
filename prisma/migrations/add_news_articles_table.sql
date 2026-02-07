-- Add NewsArticle table to store scraped news articles

CREATE TABLE IF NOT EXISTS "NewsArticle" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "author" TEXT NOT NULL,
    "authorAvatar" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readTime" INTEGER DEFAULT 5,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "sourceUrl" TEXT UNIQUE,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isAI" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN DEFAULT false,
    "isSponsored" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "NewsArticle_category_idx" ON "NewsArticle"("category");
CREATE INDEX IF NOT EXISTS "NewsArticle_publishedAt_idx" ON "NewsArticle"("publishedAt" DESC);
CREATE INDEX IF NOT EXISTS "NewsArticle_views_idx" ON "NewsArticle"("views" DESC);
CREATE INDEX IF NOT EXISTS "NewsArticle_isTrending_idx" ON "NewsArticle"("isTrending");
CREATE INDEX IF NOT EXISTS "NewsArticle_tags_idx" ON "NewsArticle" USING GIN ("tags");
