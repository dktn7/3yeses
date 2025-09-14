const { PrismaClient } = require('@prisma/client');

async function checkUpdatedCategories() {
  const prisma = new PrismaClient();
  
  try {
    const musicCategory = await prisma.category.findFirst({
      where: { name: 'Music & Audio' },
      include: { subcategories: true }
    });
    
    const actingCategory = await prisma.category.findFirst({
      where: { name: 'Acting & Performance' },
      include: { subcategories: true }
    });
    
    console.log('\n🎵 MUSIC & AUDIO SUBCATEGORIES:');
    musicCategory?.subcategories.forEach(sub => {
      console.log(`  ♪ ${sub.name}`);
    });
    
    console.log('\n🎭 ACTING & PERFORMANCE SUBCATEGORIES:');
    actingCategory?.subcategories.forEach(sub => {
      console.log(`  🎬 ${sub.name}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUpdatedCategories();
