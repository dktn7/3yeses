import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const cats = await prisma.talentCategory.findMany({
      include: { subcategories: true },
      orderBy: { name: 'asc' }
    });

    if (cats.length === 0) {
      console.log('No categories found.');
      return;
    }

    console.log(`Found ${cats.length} categories:`);
    for (const c of cats) {
      console.log(`- ${c.name}`);
      if (c.subcategories && c.subcategories.length > 0) {
        for (const s of c.subcategories) {
          console.log(`    - ${s.name}`);
        }
      } else {
        console.log('    (no subcategories)');
      }
    }
  } catch (err) {
    console.error('Error listing categories:', err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

main();
