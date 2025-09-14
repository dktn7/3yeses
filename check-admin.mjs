// Check admin users in database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminUsers() {
  try {
    const admins = await prisma.user.findMany({ 
      where: { role: 'ADMIN' },
      select: { email: true, name: true, role: true, id: true }
    });
    
    console.log('Admin users found:', admins);
    
    if (admins.length === 0) {
      console.log('No admin users found. Creating one...');
      
      // Import bcrypt
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.default.genSalt(10);
      const hashedPassword = await bcrypt.default.hash('AdminPassword123!', salt);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@3yeses.com',
          password: hashedPassword,
          name: 'System Admin',
          role: 'ADMIN'
        }
      });
      
      console.log('Created new admin:', { email: newAdmin.email, name: newAdmin.name });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();
