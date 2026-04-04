import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REMOVE_CATEGORIES = [
  'Photography (Commercial)',
  'Graphic Design',
  'Hair & Makeup (Professional)',
  'Circus Arts',
  'Magic & Illusion',
  'Beauty & Wellness',
  'Content Creation',
  'Influencer/Content Creator',
  'Translation & Localization'
];

async function removeCategory(name) {
  const cat = await prisma.talentCategory.findUnique({ where: { name } });
  if (!cat) {
    console.log(`Category not found, skipping: ${name}`);
    return;
  }

  const subcats = await prisma.talentSubcategory.findMany({ where: { categoryId: cat.id } });
  const profileCount = await prisma.talentProfile.count({ where: { categoryId: cat.id } });

  if (profileCount > 0) {
    console.log(`Reassigning ${profileCount} talent profiles from category '${name}' to null category/subcategory.`);
    await prisma.talentProfile.updateMany({ where: { categoryId: cat.id }, data: { categoryId: null, subcategoryId: null } });
  }

  if (subcats.length > 0) {
    const subIds = subcats.map(s => s.id);
    await prisma.talentSubcategory.deleteMany({ where: { id: { in: subIds } } });
    console.log(`Deleted ${subcats.length} subcategories for category '${name}'.`);
  }

  await prisma.talentCategory.delete({ where: { id: cat.id } });
  console.log(`Deleted category '${name}'.`);
}

async function mergeMusicProduction() {
  const srcName = 'Music Production';
  const destName = 'Music & Audio';

  const src = await prisma.talentCategory.findUnique({ where: { name: srcName }, include: { subcategories: true } });
  let dest = await prisma.talentCategory.findUnique({ where: { name: destName }, include: { subcategories: true } });

  if (!src) {
    console.log(`Source category not found: ${srcName}. Nothing to merge.`);
    return;
  }
  if (!dest) {
    console.log(`Destination category not found: ${destName}. Creating it.`);
    // create dest category
    const newDest = await prisma.talentCategory.create({ data: { name: destName, description: `${destName} (merged)` } });
    dest = newDest; // eslint-disable-line no-param-reassign
  }

  // Map existing dest subcategory names to ids
  const destSubMap = new Map();
  for (const s of dest.subcategories) destSubMap.set(s.name, s.id);

  // For each src subcategory, create or reuse under dest, then update profiles
  for (const s of src.subcategories) {
    let targetSubId = destSubMap.get(s.name);
    if (!targetSubId) {
      const created = await prisma.talentSubcategory.create({ data: { name: s.name, description: s.description || `${s.name} (migrated)`, categoryId: dest.id } });
      targetSubId = created.id;
      console.log(`Created subcategory '${s.name}' under '${destName}'.`);
    } else {
      console.log(`Reusing existing subcategory '${s.name}' under '${destName}'.`);
    }

    const updated = await prisma.talentProfile.updateMany({ where: { subcategoryId: s.id }, data: { categoryId: dest.id, subcategoryId: targetSubId } });
    console.log(`Moved ${updated.count} profiles from subcategory '${s.name}' to '${destName}/${s.name}'.`);
  }

  // Move any profiles that referenced the src category but had no subcategory
  const orphanProfiles = await prisma.talentProfile.findMany({ where: { categoryId: src.id, subcategoryId: null }, select: { userId: true } });
  if (orphanProfiles.length > 0) {
    // ensure a fallback subcategory under dest
    const fallbackName = 'Music Production - General';
    let fallback = await prisma.talentSubcategory.findFirst({ where: { categoryId: dest.id, name: fallbackName } });
    if (!fallback) {
      fallback = await prisma.talentSubcategory.create({ data: { name: fallbackName, description: 'Migrated general subcategory', categoryId: dest.id } });
      console.log(`Created fallback subcategory '${fallbackName}' under '${destName}'.`);
    }
    const ids = orphanProfiles.map(p => p.userId);
    await prisma.talentProfile.updateMany({ where: { userId: { in: ids } }, data: { categoryId: dest.id, subcategoryId: fallback.id } });
    console.log(`Assigned ${orphanProfiles.length} orphan profiles to '${destName}/${fallbackName}'.`);
  }

  // Delete old src subcategories and src category
  if (src.subcategories.length > 0) {
    const subIds = src.subcategories.map(s => s.id);
    await prisma.talentSubcategory.deleteMany({ where: { id: { in: subIds } } });
    console.log(`Deleted ${src.subcategories.length} old subcategories from '${srcName}'.`);
  }

  await prisma.talentCategory.delete({ where: { id: src.id } });
  console.log(`Deleted source category '${srcName}' after merge.`);
}

async function main() {
  try {
    console.log('Starting category migration...');

    for (const name of REMOVE_CATEGORIES) {
      await removeCategory(name);
    }

    await mergeMusicProduction();

    console.log('Category migration completed.');
  } catch (err) {
    console.error('Migration error:', err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

main();
