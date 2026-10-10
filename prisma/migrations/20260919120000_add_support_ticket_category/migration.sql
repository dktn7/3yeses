CREATE TYPE "public"."SupportTicketCategory" AS ENUM ('ACCOUNT', 'BILLING', 'PORTFOLIO', 'CATEGORIES', 'NOTIFICATIONS', 'SECURITY', 'OTHER');

ALTER TABLE "public"."SupportTicket"
ADD COLUMN "category" "public"."SupportTicketCategory" NOT NULL DEFAULT 'OTHER';

CREATE INDEX "SupportTicket_category_idx" ON "public"."SupportTicket"("category");
