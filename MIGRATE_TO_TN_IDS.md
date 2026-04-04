# Migration Guide: Changing User IDs to TN Format

## Overview
This guide explains how to transition from auto-generated CUID user IDs to custom "TN" format IDs (TN1, TN100, TN145, etc.).

## Changes Made

### 1. Schema Update
- **File**: `/prisma/schema.prisma`
- **Change**: Removed `@default(cuid())` from User model ID field
- User IDs are now manually assigned in TN format

### 2. ID Generator
- **File**: `/lib/id-generator.ts` (NEW)
- **Purpose**: Generates sequential TN IDs (TN1, TN2, TN3, etc.)
- **Functions**:
  - `generateNextUserId()`: Returns next available TN ID
  - `isValidTNId(id)`: Validates TN ID format
  - `getTNNumber(id)`: Extracts numeric part from TN ID

### 3. Registration Update
- **File**: `/app/api/auth/register/route.ts`
- **Change**: Now generates TN ID before creating user
- New users will automatically get TN format IDs

### 4. Seed Data Update
- **File**: `/prisma/seed.ts`
- **Change**: All seed users now have manual TN IDs:
  - TN1: Admin User (admin@example.com)
  - TN2: Admin User (admin@3yeses.online)
  - TN3: Sarah Johnson (sarah@example.com)
  - TN4: Carlos Rodriguez (carlos@example.com)

## Migration Options

### Option 1: Fresh Database (Recommended for Development)
If you're in development and can afford to lose existing data:

```bash
# Drop and recreate the database
npx prisma migrate reset

# This will:
# 1. Drop the database
# 2. Create a new database
# 3. Apply all migrations
# 4. Run the seed file with TN IDs
```

### Option 2: Keep Existing Data (Production)
If you have existing users and need to preserve data:

#### Step 1: Backup Your Database

**On Windows (using pgAdmin or full path):**

Option A - Using full path to pg_dump:
```powershell
# Find your PostgreSQL installation path (usually in Program Files)
# Default paths:
# PostgreSQL 16: "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe"
# PostgreSQL 15: "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe"

# Replace XX with your PostgreSQL version
& "C:\Program Files\PostgreSQL\XX\bin\pg_dump.exe" -U dktk -d talentdb > backup_before_tn_migration.sql
```

Option B - Using pgAdmin GUI (Recommended for Windows):
1. **Open pgAdmin** (download from https://www.pgadmin.org/download/ if not installed)
2. **Connect to your database**:
   - If using local PostgreSQL: Create a new server connection
   - If using Docker: Connect to your Docker PostgreSQL container
3. **Navigate to your database**:
   - Expand the server connection
   - Find and select your database "talentdb"
4. **Right-click on "talentdb"**
5. **Select "Backup..."** from the context menu
6. **Configure backup settings**:
   - **Filename**: `C:\Users\dktk\Desktop\backup_before_tn_migration.backup` (or choose your preferred location)
   - **Format**: Choose "Custom" or "Plain" (Custom is recommended for full restoration)
   - **Encoding**: UTF8 (default)
   - **Role name**: dktk (your database user)
7. **Click "Backup"** button
8. **Wait for completion** - you'll see a success message when done

**Alternative: If using Docker PostgreSQL**
- Connect pgAdmin to: `localhost:5432` (or your Docker port)
- Username: `dktk`
- Password: your database password
- Database: `talentdb`

**pgAdmin Connection Troubleshooting:**
- **Can't connect?** Make sure PostgreSQL is running
- **Docker users:** Ensure port mapping is correct (usually 5432:5432)
- **Local PostgreSQL:** Check if service is started in Windows Services
- **Firewall:** May need to allow pgAdmin through Windows Firewall

**After successful backup:**
- Verify the backup file was created and has content
- Store it safely (external drive recommended)
- Proceed to Step 2: Create Migration Manually

Option C - Using Docker (if using Docker PostgreSQL):
```powershell
docker exec -t 3yeses-postgres-1 pg_dump -U dktk talentdb > backup_before_tn_migration.sql
```

**On Linux/Mac:**
```bash
pg_dump -U your_user -d talentdb > backup_before_tn_migration.sql
```

#### Step 2: Create Migration Manually
Create a new migration file matching the schema change:

```bash
npx prisma migrate dev --name change_to_tn_ids --create-only
```

#### Step 3: Update Existing User IDs

**⚠️ IMPORTANT: Run Docker commands from your terminal, NOT from inside psql!**

If you see this error:
```
ERROR: syntax error at or near "docker"
```

It means you tried to run a Docker command from inside the psql interactive session. Here's the correct sequence:

### Step-by-Step Execution:

1. **First, exit psql if you're in it:**
   ```sql
   \q
   ```

2. **From your regular terminal/command prompt, connect to psql:**
   ```bash
   docker exec -it 3yeses-postgres-1 psql -U user -d talentdb
   ```

3. **Now you're in psql. Run the SQL commands one by one:**

   ```sql
   -- Command 1: Add temporary column
   ALTER TABLE "User" ADD COLUMN "new_id" TEXT;

   -- Command 2: Generate TN IDs
   WITH numbered_users AS (
     SELECT
       id,
       ROW_NUMBER() OVER (ORDER BY "createdAt") as row_num
     FROM "User"
   )
   UPDATE "User"
   SET "new_id" = 'TN' || numbered_users.row_num
   FROM numbered_users
   WHERE "User".id = numbered_users.id;

   -- Command 3: Check what tables have userId columns
   SELECT table_name, column_name
   FROM information_schema.columns
   WHERE column_name = 'userId' AND table_schema = 'public';

   -- Command 4+: Update each table (run these based on the results above)
   UPDATE "TalentProfile" SET "userId" = "User"."new_id" FROM "User" WHERE "TalentProfile"."userId" = "User".id;
   UPDATE "Subscription" SET "userId" = "User"."new_id" FROM "User" WHERE "Subscription"."userId" = "User".id;
   -- Add more UPDATE statements for any other tables shown...

   -- Final commands:
   ALTER TABLE "User" DROP COLUMN id;
   ALTER TABLE "User" RENAME COLUMN "new_id" TO id;
   ALTER TABLE "User" ADD PRIMARY KEY (id);
   ```

4. **Exit psql when done:**
   ```sql
   \q
   ```

**Copy and paste these SQL commands ONE BY ONE into your psql session:**

```sql
-- STEP 1: Add temporary column for new TN IDs
ALTER TABLE "User" ADD COLUMN "new_id" TEXT;

-- STEP 2: Generate TN IDs for existing users (sequential by creation date)
WITH numbered_users AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "createdAt") as row_num
  FROM "User"
)
UPDATE "User"
SET "new_id" = 'TN' || numbered_users.row_num
FROM numbered_users
WHERE "User".id = numbered_users.id;

-- STEP 3: Check which tables have userId foreign keys
SELECT table_name, column_name
FROM information_schema.columns
WHERE column_name = 'userId' AND table_schema = 'public';

-- STEP 4: Update foreign key references (run these for each table found above)
-- Replace "TableName" with actual table names from the query results

UPDATE "TalentProfile" SET "userId" = "User"."new_id" FROM "User" WHERE "TalentProfile"."userId" = "User".id;
UPDATE "Subscription" SET "userId" = "User"."new_id" FROM "User" WHERE "Subscription"."userId" = "User".id;
UPDATE "Payment" SET "userId" = "User"."new_id" FROM "User" WHERE "Payment"."userId" = "User".id;

-- STEP 5: Finalize the migration
ALTER TABLE "User" DROP COLUMN id;
ALTER TABLE "User" RENAME COLUMN "new_id" TO id;
ALTER TABLE "User" ADD PRIMARY KEY (id);
```

**If you get this error:**
```
DETAIL: Key (userId)=(TN497) is not present in table "User".
```

**This means some foreign key tables already have TN format userId values, but the User table hasn't been updated yet.**

### Investigation Steps:

1. **Check what userId values exist in your foreign key tables:**
   ```sql
   SELECT DISTINCT "userId" FROM "TalentProfile" LIMIT 10;
   SELECT DISTINCT "userId" FROM "Subscription" LIMIT 10;
   SELECT DISTINCT "userId" FROM "Payment" LIMIT 10;
   ```

2. **Check what id values exist in the User table:**
   ```sql
   SELECT id FROM "User" LIMIT 10;
   ```

3. **Count how many TN format vs CUID format userIds you have:**
   ```sql
   SELECT
     COUNT(*) as total_users,
     COUNT(CASE WHEN id LIKE 'TN%' THEN 1 END) as tn_format_users,
     COUNT(CASE WHEN id NOT LIKE 'TN%' THEN 1 END) as cuid_format_users
   FROM "User";
   ```

### Possible Solutions:

**Option A: If User table still has CUIDs but foreign keys have TN IDs (partial migration):**
```sql
-- First, create a mapping from TN IDs back to CUIDs
-- You'll need to figure out which TN ID maps to which CUID
-- This might require checking your backup or application logs

-- Example (replace with actual mapping):
UPDATE "TalentProfile"
SET "userId" = 'actual-cuid-here'
WHERE "userId" = 'TN497';
```

**Option B: If you want to skip tables that already have TN IDs:**
```sql
-- Only update rows where userId is not already in TN format
UPDATE "TalentProfile"
SET "userId" = "User"."new_id"
FROM "User"
WHERE "TalentProfile"."userId" = "User".id
  AND "TalentProfile"."userId" NOT LIKE 'TN%';
```

**Option C: Check if migration was already partially completed:**
```sql
-- See if new_id column already exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'User' AND column_name = 'new_id';
```

### Recommended Approach:

1. **Backup your current state** (if not already done)
2. **Investigate the data inconsistency**
3. **Either:**
   - Restore from backup and start fresh, OR
   - Manually fix the inconsistent data, OR
   - Skip already-converted foreign keys

**Your User table still has CUID format IDs, but some foreign key tables have TN format IDs. This is a data inconsistency.**

### Next Investigation Steps:

Run these queries to find the mismatch:

```sql
-- Check what userId values are in TalentProfile
SELECT DISTINCT "userId" FROM "TalentProfile" LIMIT 10;

-- Check what userId values are in Subscription
SELECT DISTINCT "userId" FROM "Subscription" LIMIT 10;

-- Check what userId values are in Payment
SELECT DISTINCT "userId" FROM "Payment" LIMIT 10;

-- Find which specific records have TN format userIds
SELECT * FROM "TalentProfile" WHERE "userId" LIKE 'TN%';
SELECT * FROM "Subscription" WHERE "userId" LIKE 'TN%';
SELECT * FROM "Payment" WHERE "userId" LIKE 'TN%';
```

### Most Likely Cause:
Some foreign key tables were updated with TN IDs during a previous migration attempt, but the User table wasn't fully migrated.

### Solution Options:

**Option 1: Skip already-converted foreign keys (Recommended):**
```sql
-- Only update rows where userId is NOT already in TN format
UPDATE "TalentProfile" 
SET "userId" = "User"."new_id" 
FROM "User" 
WHERE "TalentProfile"."userId" = "User".id 
  AND "TalentProfile"."userId" NOT LIKE 'TN%';

UPDATE "Subscription" 
SET "userId" = "User"."new_id" 
FROM "User" 
WHERE "Subscription"."userId" = "User".id 
  AND "Subscription"."userId" NOT LIKE 'TN%';

UPDATE "Payment" 
SET "userId" = "User"."new_id" 
FROM "User" 
WHERE "Payment"."userId" = "User".id 
  AND "Payment"."userId" NOT LIKE 'TN%';
```

**Option 2: If you want to start fresh (if you have a good backup):**
```sql
-- Drop the partially migrated data and restore from backup
-- Then run the migration from the beginning
```

**The issue is foreign key constraints!** The UPDATE is trying to set userId to TN format values, but the User table's primary key is still on the old CUID column. The foreign key constraint fails because TN72 doesn't exist as a primary key yet.

### Correct Migration Order:

You need to **drop the primary key constraint first**, then update foreign keys, then recreate the primary key.

### Fixed Migration Steps:

```sql
-- STEP 1: Drop the primary key constraint temporarily
ALTER TABLE "User" DROP CONSTRAINT "User_pkey";

-- STEP 2: Add temporary column
ALTER TABLE "User" ADD COLUMN "new_id" TEXT;

-- STEP 3: Generate TN IDs
WITH numbered_users AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "createdAt") as row_num
  FROM "User"
)
UPDATE "User"
SET "new_id" = 'TN' || numbered_users.row_num
FROM numbered_users
WHERE "User".id = numbered_users.id;

-- STEP 4: Update foreign key references (NOW this will work)
UPDATE "TalentProfile"
SET "userId" = "User"."new_id"
FROM "User"
WHERE "TalentProfile"."userId" = "User".id;

UPDATE "Subscription"
SET "userId" = "User"."new_id"
FROM "User"
WHERE "Subscription"."userId" = "User".id;

UPDATE "Payment"
SET "userId" = "User"."new_id"
FROM "User"
WHERE "Payment"."userId" = "User".id;

-- STEP 5: Finalize the migration
ALTER TABLE "User" DROP COLUMN id;
ALTER TABLE "User" RENAME COLUMN "new_id" TO id;
ALTER TABLE "User" ADD PRIMARY KEY (id);
```

**You can't drop the primary key because foreign key constraints depend on it.** The solution is to **drop the foreign key constraints temporarily**, then drop the primary key, then recreate everything.

### Correct Migration Order (Complete):

```sql
-- STEP 1: Drop all foreign key constraints temporarily
ALTER TABLE "TalentProfile" DROP CONSTRAINT "TalentProfile_userId_fkey";
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";
ALTER TABLE "Review" DROP CONSTRAINT "Review_reviewerId_fkey";
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";
ALTER TABLE "CommentLike" DROP CONSTRAINT "CommentLike_userId_fkey";
ALTER TABLE "Report" DROP CONSTRAINT "Report_reporterId_fkey";
ALTER TABLE "Report" DROP CONSTRAINT "Report_reportedUserId_fkey";
ALTER TABLE "Report" DROP CONSTRAINT "Report_handledById_fkey";
ALTER TABLE "ProfileView" DROP CONSTRAINT "ProfileView_viewerId_fkey";
ALTER TABLE "PortfolioView" DROP CONSTRAINT "PortfolioView_viewerId_fkey";

-- STEP 2: Drop the primary key constraint
ALTER TABLE "User" DROP CONSTRAINT "User_pkey";

-- STEP 3: Add temporary column and generate TN IDs
ALTER TABLE "User" ADD COLUMN "new_id" TEXT;

WITH numbered_users AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "createdAt") as row_num
  FROM "User"
)
UPDATE "User"
SET "new_id" = 'TN' || numbered_users.row_num
FROM numbered_users
WHERE "User".id = numbered_users.id;

-- STEP 4: Update all foreign key references
UPDATE "TalentProfile" SET "userId" = "User"."new_id" FROM "User" WHERE "TalentProfile"."userId" = "User".id;
UPDATE "Subscription" SET "userId" = "User"."new_id" FROM "User" WHERE "Subscription"."userId" = "User".id;
UPDATE "Payment" SET "userId" = "User"."new_id" FROM "User" WHERE "Payment"."userId" = "User".id;
UPDATE "Review" SET "reviewerId" = "User"."new_id" FROM "User" WHERE "Review"."reviewerId" = "User".id;
UPDATE "Like" SET "userId" = "User"."new_id" FROM "User" WHERE "Like"."userId" = "User".id;
UPDATE "Comment" SET "userId" = "User"."new_id" FROM "User" WHERE "Comment"."userId" = "User".id;
UPDATE "CommentLike" SET "userId" = "User"."new_id" FROM "User" WHERE "CommentLike"."userId" = "User".id;
UPDATE "Report" SET "reporterId" = "User"."new_id" FROM "User" WHERE "Report"."reporterId" = "User".id;
UPDATE "Report" SET "reportedUserId" = "User"."new_id" FROM "User" WHERE "Report"."reportedUserId" = "User".id;
UPDATE "Report" SET "handledById" = "User"."new_id" FROM "User" WHERE "Report"."handledById" = "User".id;
UPDATE "ProfileView" SET "viewerId" = "User"."new_id" FROM "User" WHERE "ProfileView"."viewerId" = "User".id;
UPDATE "PortfolioView" SET "viewerId" = "User"."new_id" FROM "User" WHERE "PortfolioView"."viewerId" = "User".id;

-- STEP 5: Finalize User table
ALTER TABLE "User" DROP COLUMN id;
ALTER TABLE "User" RENAME COLUMN "new_id" TO id;
ALTER TABLE "User" ADD PRIMARY KEY (id);

-- STEP 6: Recreate all foreign key constraints
ALTER TABLE "TalentProfile" ADD CONSTRAINT "TalentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id);
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id);
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id);
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"(id);
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id);
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id);
ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id);
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"(id);
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"(id);
ALTER TABLE "Report" ADD CONSTRAINT "Report_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "User"(id);
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"(id);
ALTER TABLE "PortfolioView" ADD CONSTRAINT "PortfolioView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"(id);
```

#### Step 4: Apply Migration
```bash
npx prisma migrate deploy
```

## Testing the New System

### Test New User Registration
```bash
# Start the dev server
npm run dev

# Register a new user
# Should automatically get ID like TN5, TN6, etc.
```

### Verify ID Generator
```typescript
import { generateNextUserId } from '@/lib/id-generator';

// Test in a Node.js REPL or test file
const nextId = await generateNextUserId();
console.log(nextId); // Should print: TN5 (or next sequential number)
```

## Benefits of TN ID Format

1. **Human-Readable**: Easy to reference in support (e.g., "Check user TN145")
2. **Sequential**: Shows order of user registration
3. **Shorter**: Easier to type and communicate than CUIDs
4. **Branded**: "TN" can stand for "Talent Number" or your brand name

## Rollback Plan

If you need to rollback:

1. Restore database from backup:
   ```bash
   psql -U your_user -d talentdb < backup_before_tn_migration.sql
   ```

2. Revert code changes:
   ```bash
   git checkout HEAD~1 -- prisma/schema.prisma
   git checkout HEAD~1 -- lib/id-generator.ts
   git checkout HEAD~1 -- app/api/auth/register/route.ts
   git checkout HEAD~1 -- prisma/seed.ts
   ```

3. Regenerate Prisma client:
   ```bash
   npx prisma generate
   ```

## Known Limitations

1. **ID Collisions**: If you're running multiple instances, ensure proper locking or use a centralized ID service
2. **Migration Complexity**: Converting existing data requires careful SQL execution
3. **Backup First**: Always backup before applying ID changes to production

## Questions or Issues?

- Check logs if ID generation fails
- Ensure database connection is stable
- Verify no concurrent user creations during migration
