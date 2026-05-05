import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY_NAMES = [
  'Voice Over & Dubbing',
  'Translation & Localization',
  'Content Creation',
  'Music & Audio',
  'Video Production',
  'Acting & Performance',
  'Modeling',
  'Dancing & Choreography',
  'Beauty & Wellness',
  'Sports & Fitness',
  'Stunts',
  'Magic & Illusion',
  'Circus Arts',
  'Comedy',
  'Photography (Commercial)',
  'Graphic Design',
  'Music Production',
  'Influencer/Content Creator',
  'Hair & Makeup (Professional)'
];

async function ensureCategory(name) {
  // Try to find existing category by name
  let category = await prisma.talentCategory.findUnique({ where: { name } });
  if (!category) {
    category = await prisma.talentCategory.create({ data: { name, description: `${name}` } });
    console.log(`Created category: ${name}`);
  } else {
    console.log(`Category exists: ${name}`);
  }

  // Ensure at least one subcategory exists for this category
  const existingSubs = await prisma.talentSubcategory.findMany({ where: { categoryId: category.id } });
  if (existingSubs.length === 0) {
    const subName = `${name} - General`;
    await prisma.talentSubcategory.create({ data: { name: subName, categoryId: category.id, description: `Default subcategory for ${name}` } });
    console.log(`  Created default subcategory: ${subName}`);
  } else {
    console.log(`  Subcategories present: ${existingSubs.length}`);
  }
}

async function main() {
  try {
    for (const name of CATEGORY_NAMES) {
      await ensureCategory(name);
    }
    console.log('All categories ensured.');
  } catch (err) {
    console.error('Error ensuring categories:', err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

main();
