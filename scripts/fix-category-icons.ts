/**
 * Migration script: Update category icons from emojis to Lucide icon names.
 * Run with: npx tsx scripts/fix-category-icons.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ICON_MAPPING: Record<string, string> = {
  'Voice Over & Dubbing': 'Mic',
  'Translation & Localization': 'Globe',
  'Content Creation': 'PenTool',
  'Music & Audio': 'Music',
  'Video Production': 'Clapperboard',
  'Acting & Performance': 'Drama',
  'Modeling': 'Camera',
  'Dancing & Choreography': 'Users',
  'Beauty & Wellness': 'Heart',
  'Sports & Fitness': 'Trophy',
  'Stunts': 'Flame',
  'Magic & Illusion': 'Sparkles',
  'Circus Arts': 'Tent',
  'Comedy': 'Smile',
  'Photography (Commercial)': 'Aperture',
  'Graphic Design': 'Palette',
  'Music Production': 'Sliders',
  'Influencer/Content Creator': 'Smartphone',
  'Hair & Makeup (Professional)': 'Scissors',
  'Stage Crew/Technician': 'Wrench',
  'Animation': 'Film',
};

async function main() {
  console.log('Updating category icons from emojis to Lucide names...\n');

  const categories = await prisma.talentCategory.findMany();
  let updated = 0;
  let skipped = 0;

  for (const category of categories) {
    const newIcon = ICON_MAPPING[category.name];
    if (newIcon) {
      await prisma.talentCategory.update({
        where: { id: category.id },
        data: { icon: newIcon },
      });
      console.log(`  ✓ ${category.name}: "${category.icon}" → "${newIcon}"`);
      updated++;
    } else {
      console.log(`  ⚠ ${category.name}: no mapping found (keeping "${category.icon}")`);
      skipped++;
    }
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
