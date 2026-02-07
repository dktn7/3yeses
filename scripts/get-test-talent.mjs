import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getTestTalent() {
  try {
    const profile = await prisma.talentProfile.findUnique({
      where: { id: 'cmlbas5620002vvc49snthhi4' },
      include: { user: true }
    });
    
    console.log(JSON.stringify(profile, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getTestTalent();
