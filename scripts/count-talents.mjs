import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countTalents() {
  const count = await prisma.talentProfile.count();
  console.log('Total Talent Profiles:', count);
  await prisma.$disconnect();
}

countTalents();
