const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log('Current categories:');
    categories.forEach(category => {
      console.log(`\n${category.name}:`);
      console.log(`  Description: ${category.description}`);
      console.log(`  Subcategories:`);
      category.subcategories.forEach(sub => {
        console.log(`    - ${sub.name}: ${sub.description}`);
      });
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
