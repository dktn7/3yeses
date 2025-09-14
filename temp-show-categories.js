const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showCategoriesOverview() {
  try {
    console.log('🎯 Current Categories Overview\n');

    const categories = await prisma.category.findMany({
      include: {
        subcategories: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`📊 Total Categories: ${categories.length}\n`);

    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.icon || '📁'} ${category.name} (${category.subcategories.length} subcategories)`);
      
      if (category.name === 'Musicians') {
        console.log('   🎵 Music subcategories:');
        category.subcategories.slice(0, 10).forEach(sub => {
          console.log(`      • ${sub.name}`);
        });
        if (category.subcategories.length > 10) {
          console.log(`      • ... and ${category.subcategories.length - 10} more`);
        }
      }
    });

    const totalSubcategories = categories.reduce((sum, cat) => sum + cat.subcategories.length, 0);
    console.log(`\n🎯 Grand Total: ${categories.length} categories with ${totalSubcategories} subcategories`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showCategoriesOverview();
