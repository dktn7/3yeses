ALTER TABLE "User"
ADD COLUMN "passwordChangeCodeHash" TEXT,
ADD COLUMN "passwordChangeCodeExpiry" TIMESTAMP(3),
ADD COLUMN "passwordChangeCodeSentAt" TIMESTAMP(3),
ADD COLUMN "passwordChangeCodeAttempts" INTEGER NOT NULL DEFAULT 0;
