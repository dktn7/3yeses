import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const orphans = await prisma.talentProfile.findMany({
      where: { categoryId: null, subcategoryId: null },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    if (orphans.length === 0) {
      console.log('No orphaned profiles found.');
      return;
    }

    console.log(`Found ${orphans.length} orphaned profiles (showing up to 50):`);
    for (const p of orphans) {
      console.log(`- user.email=${p.user.email} userId=${p.userId} createdAt=${p.createdAt.toISOString()}`);
    }
  } catch (err) {
    console.error('Error listing orphaned profiles:', err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

main();
