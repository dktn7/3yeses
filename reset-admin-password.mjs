// Reset admin password
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...');
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('AdminPassword123!', salt);
    
    const updatedAdmin = await prisma.user.update({
      where: { email: 'admin@3yeses.com' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Admin password reset successfully!');
    console.log('Email: admin@3yeses.com');
    console.log('Password: AdminPassword123!');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
