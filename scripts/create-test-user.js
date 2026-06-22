const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { email: 'test@3yeses.online' }
    });

    if (existing) {
      console.log('Test user already exists, updating password...');
      const hashedPassword = await bcrypt.hash('Test123!', 12);
      await prisma.user.update({
        where: { id: existing.id },
        data: { password: hashedPassword, emailVerified: new Date() }
      });
      console.log('Password updated!');
    } else {
      const hashedPassword = await bcrypt.hash('Test123!', 12);
      const user = await prisma.user.create({
        data: {
          id: randomUUID(),
          email: 'test@3yeses.online',
          password: hashedPassword,
          name: 'Test User',
          role: 'TALENT',
          emailVerified: new Date()
        }
      });
      console.log('Created test user:', user.email);
    }

    console.log('\n=== Test Account ===');
    console.log('Email: test@3yeses.online');
    console.log('Password: Test123!');
    console.log('====================\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
