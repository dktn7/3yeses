const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function separateModelingAndActing() {
  try {
    // First, let's find the current "Modeling & Acting" category
    const currentCategory = await prisma.category.findFirst({
      where: {
        name: 'Modeling & Acting'
      },
      include: {
        subcategories: true,
      },
    });

    if (!currentCategory) {
      console.log('Modeling & Acting category not found');
      return;
    }

    console.log('Found category:', currentCategory.name);

    // Create two separate categories
    const modelingCategory = await prisma.category.create({
      data: {
        name: 'Modeling',
        description: 'Professional modeling talent for various industries',
        icon: 'Camera',
      },
    });

    const actingCategory = await prisma.category.create({
      data: {
        name: 'Acting',
        description: 'Professional acting talent for film, TV, and commercial work',
        icon: 'Users',
      },
    });

    console.log('Created new categories:', modelingCategory.name, 'and', actingCategory.name);

    // Move modeling-related subcategories to the modeling category
    const modelingSubcategories = ['Fashion Modeling', 'Hand Modeling', 'Fitness Modeling', 'Product Modeling'];
    const actingSubcategories = ['Commercial Acting', 'Background Acting', 'Voice Acting'];

    for (const subName of modelingSubcategories) {
      const subcategory = currentCategory.subcategories.find(sub => sub.name === subName);
      if (subcategory) {
        await prisma.subcategory.update({
          where: { id: subcategory.id },
          data: { categoryId: modelingCategory.id },
        });
        console.log(`Moved ${subName} to Modeling category`);
      }
    }

    for (const subName of actingSubcategories) {
      const subcategory = currentCategory.subcategories.find(sub => sub.name === subName);
      if (subcategory) {
        await prisma.subcategory.update({
          where: { id: subcategory.id },
          data: { categoryId: actingCategory.id },
        });
        console.log(`Moved ${subName} to Acting category`);
      }
    }

    // Delete the old combined category (only if no subcategories remain)
    const remainingSubcategories = await prisma.subcategory.findMany({
      where: { categoryId: currentCategory.id },
    });

    if (remainingSubcategories.length === 0) {
      await prisma.category.delete({
        where: { id: currentCategory.id },
      });
      console.log('Deleted old combined category');
    } else {
      console.log('Some subcategories remain in the old category:', remainingSubcategories.map(s => s.name));
    }

    console.log('Successfully separated Modeling and Acting categories!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

separateModelingAndActing();
