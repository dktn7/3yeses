import bcrypt from 'bcryptjs';

const testPassword = 'password123';
const storedHash = '$2b$10$63LKTJJIiZXsFyxDBIj.p.BVfKZLaxHHrJaXaH7RfTggcmYcy9m3.';

async function verifyPassword() {
  try {
    const isValid = await bcrypt.compare(testPassword, storedHash);
    console.log('Password "password123" matches stored hash:', isValid);
    
    // Let's also test creating a new hash
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('\nNew hash for "password123":', newHash);
    
    const isNewValid = await bcrypt.compare(testPassword, newHash);
    console.log('New hash verification:', isNewValid);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyPassword();
