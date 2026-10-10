-- CreateTable
CREATE TABLE "public"."PortfolioItemLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "portfolioItemId" TEXT NOT NULL,

    CONSTRAINT "PortfolioItemLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortfolioItemLike_userId_idx" ON "public"."PortfolioItemLike"("userId");

-- CreateIndex
CREATE INDEX "PortfolioItemLike_portfolioItemId_idx" ON "public"."PortfolioItemLike"("portfolioItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioItemLike_userId_portfolioItemId_key" ON "public"."PortfolioItemLike"("userId", "portfolioItemId");

-- AddForeignKey
ALTER TABLE "public"."PortfolioItemLike" ADD CONSTRAINT "PortfolioItemLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortfolioItemLike" ADD CONSTRAINT "PortfolioItemLike_portfolioItemId_fkey" FOREIGN KEY ("portfolioItemId") REFERENCES "public"."PortfolioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
