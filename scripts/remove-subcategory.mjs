import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const category = await prisma.talentCategory.findUnique({ where: { name: 'Music & Audio' }, include: { subcategories: true } });
    if (!category) {
      console.log('Category Music & Audio not found.');
      return;
    }

    const src = category.subcategories.find(s => s.name === 'Music Production - General');
    if (!src) {
      console.log("Subcategory 'Music Production - General' not found under Music & Audio.");
      return;
    }

    const dest = category.subcategories.find(s => s.name === 'Music Production');

    if (dest) {
      const updateResult = await prisma.talentProfile.updateMany({ where: { subcategoryId: src.id }, data: { subcategoryId: dest.id } });
      console.log(`Reassigned ${updateResult.count} profiles from '${src.name}' to '${dest.name}'.`);
    } else {
      const updateResult = await prisma.talentProfile.updateMany({ where: { subcategoryId: src.id }, data: { subcategoryId: null } });
      console.log(`Cleared subcategory for ${updateResult.count} profiles previously in '${src.name}'.`);
    }

    await prisma.talentSubcategory.delete({ where: { id: src.id } });
    console.log(`Deleted subcategory '${src.name}'.`);
  } catch (err) {
    console.error('Error removing subcategory:', err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

main();
