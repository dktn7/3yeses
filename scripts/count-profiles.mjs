import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const totalProfiles = await prisma.talentProfile.count();
    const totalUsers = await prisma.user.count();
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Total TalentProfiles: ${totalProfiles}`);

    const categories = await prisma.talentCategory.findMany({
      include: { _count: { select: { talentProfiles: true } } },
      orderBy: { name: 'asc' }
    });

    console.log('\nProfiles by category:');
    for (const c of categories) {
      console.log(`- ${c.name}: ${c._count.talentProfiles}`);
    }

    const sample = await prisma.talentProfile.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: true, category: true, subcategory: true }
    });

    if (sample.length === 0) {
      console.log('\nNo sample profiles to show.');
    } else {
      console.log('\nLatest profiles (up to 10):');
      for (const p of sample) {
        console.log(`- ${p.user?.email || 'no-user'} | userId=${p.userId} | category=${p.category?.name || 'none'} | subcategory=${p.subcategory?.name || 'none'} | createdAt=${p.createdAt.toISOString()}`);
      }
    }
  } catch (err) {
    console.error('Error checking profiles:', err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

main();
