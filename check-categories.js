const { PrismaClient } = require('@prisma/client');

async function checkCategories() {
  const prisma = new PrismaClient();
  
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true
      }
    });
    
    console.log(`Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`\n- ${cat.name} (${cat.subcategories.length} subcategories)`);
      cat.subcategories.forEach(sub => {
        console.log(`  └─ ${sub.name}`);
      });
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
