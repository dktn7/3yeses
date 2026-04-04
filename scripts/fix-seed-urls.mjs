/**
 * Migration script: Replace example.com placeholder URLs in portfolio items
 * with real image/video URLs from picsum.photos and YouTube.
 *
 * Run: node scripts/fix-seed-urls.mjs
 */
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// Sample YouTube video IDs for VIDEO type items
const sampleYouTubeIds = [
  'dQw4w9WgXcQ', 'jNQXAC9IVRw', '9bZkp7q19f0', 'kJQP7kiw5Fk',
  'JGwWNGJdvx8', 'RgKAFK5djSk', 'OPf0YbXqDm0', 'fJ9rUzIMcZQ',
  '60ItHLz5WEA', 'YQHsXMglC9A', 'hT_nvWreIhg', 'CevxZvSJLk8',
  'pRpeEdMmmQ0', 'lp-EO5I60KA', 'e-ORhEE9VVg'
];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

async function main() {
  // Find all portfolio items with example.com URLs
  const items = await prisma.portfolioItem.findMany({
    where: {
      mediaUrl: { contains: 'example.com' }
    },
    select: {
      id: true,
      mediaUrl: true,
      type: true,
      talentProfileId: true,
    }
  });

  console.log(`Found ${items.length} portfolio items with example.com URLs`);

  if (items.length === 0) {
    console.log('Nothing to update.');
    return;
  }

  let updated = 0;
  for (const item of items) {
    const seed = `${item.talentProfileId}-${item.id}`;
    const numericSeed = Math.abs(hashCode(seed));

    let url, thumbnail;

    if (item.type === 'IMAGE') {
      url = `https://picsum.photos/seed/${seed}/800/600`;
      thumbnail = `https://picsum.photos/seed/${seed}/400/300`;
    } else if (item.type === 'VIDEO') {
      const ytId = sampleYouTubeIds[numericSeed % sampleYouTubeIds.length];
      url = `https://www.youtube.com/embed/${ytId}`;
      thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    } else {
      // AUDIO — keep URL but fix thumbnail
      url = item.mediaUrl;
      thumbnail = `https://picsum.photos/seed/${seed}/400/300`;
    }

    await prisma.portfolioItem.update({
      where: { id: item.id },
      data: { mediaUrl: url, thumbnail }
    });
    updated++;
  }

  console.log(`Updated ${updated} portfolio items with real URLs.`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
