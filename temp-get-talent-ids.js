const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getTalentIds() {
  try {
    const talents = await prisma.talentProfile.findMany({
      include: {
        user: { select: { name: true } },
        category: { select: { name: true } },
        subcategory: { select: { name: true } }
      },
      take: 5
    });

    console.log('🎯 Available talent profiles:\n');
    talents.forEach(talent => {
      console.log(`ID: ${talent.id}`);
      console.log(`Name: ${talent.user.name}`);
      console.log(`Role: ${talent.roleDescription}`);
      console.log(`Category: ${talent.category?.name} > ${talent.subcategory?.name}`);
      console.log(`URL: http://localhost:3001/talent/${talent.id}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getTalentIds();
