/**
 * Migration script: Convert legacy portfolioImages[] and videoUrls[] string arrays
 * into proper PortfolioItem records.
 *
 * This is a one-time idempotent migration. It:
 * 1. Reads all TalentProfiles with non-empty portfolioImages or videoUrls
 * 2. Checks existing PortfolioItem records to avoid duplicates (by URL)
 * 3. Creates PortfolioItem entries for any URLs not already in the portfolio relation
 * 4. Optionally clears the legacy arrays after migration (--clear flag)
 *
 * Usage:
 *   node scripts/migrate-legacy-portfolio.mjs          # dry-run (shows what would change)
 *   node scripts/migrate-legacy-portfolio.mjs --run     # actually migrate
 *   node scripts/migrate-legacy-portfolio.mjs --run --clear  # migrate and clear legacy arrays
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const isDryRun = !args.includes('--run');
const shouldClear = args.includes('--clear');

async function main() {
  console.log(`\n=== Legacy Portfolio Migration ===`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (use --run to apply)' : 'LIVE'}`);
  if (shouldClear) console.log(`Will clear legacy arrays after migration.`);
  console.log('');

  // Find all profiles with non-empty legacy arrays
  const profiles = await prisma.talentProfile.findMany({
    where: {
      OR: [
        { portfolioImages: { isEmpty: false } },
        { videoUrls: { isEmpty: false } },
      ],
    },
    select: {
      id: true,
      userId: true,
      portfolioImages: true,
      videoUrls: true,
      portfolio: {
        select: { mediaUrl: true },
      },
    },
  });

  console.log(`Found ${profiles.length} profiles with legacy portfolio data.\n`);

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const profile of profiles) {
    const existingUrls = new Set(profile.portfolio.map(p => p.mediaUrl));
    const toCreate = [];

    // Process images
    for (const url of profile.portfolioImages) {
      if (!url || existingUrls.has(url)) {
        totalSkipped++;
        continue;
      }
      toCreate.push({
        title: 'Portfolio Image',
        mediaUrl: url,
        type: 'IMAGE',
        talentProfileId: profile.id,
      });
    }

    // Process videos
    for (const url of profile.videoUrls) {
      if (!url || existingUrls.has(url)) {
        totalSkipped++;
        continue;
      }
      toCreate.push({
        title: 'Portfolio Video',
        mediaUrl: url,
        type: 'VIDEO',
        talentProfileId: profile.id,
      });
    }

    if (toCreate.length > 0) {
      console.log(`Profile ${profile.userId}: ${toCreate.length} items to migrate (${profile.portfolioImages.length} images, ${profile.videoUrls.length} videos)`);

      if (!isDryRun) {
        await prisma.portfolioItem.createMany({ data: toCreate });
      }

      totalCreated += toCreate.length;
    }

    // Clear legacy arrays if requested
    if (!isDryRun && shouldClear && (profile.portfolioImages.length > 0 || profile.videoUrls.length > 0)) {
      await prisma.talentProfile.update({
        where: { id: profile.id },
        data: {
          portfolioImages: { set: [] },
          videoUrls: { set: [] },
        },
      });
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Created: ${totalCreated} PortfolioItem records`);
  console.log(`Skipped: ${totalSkipped} (already exist or empty)`);
  if (isDryRun) {
    console.log(`\nThis was a DRY RUN. Run with --run to apply changes.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
