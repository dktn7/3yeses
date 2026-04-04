import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { spawn } from 'child_process';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function ensureUser(email, name, password, role = 'TALENT') {
  if (!email || !password) return null;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const hash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      email,
      name: name || email,
      password: hash,
      role,
      emailVerified: new Date(),
    },
  });
}

async function ensureTesterProfile(user) {
  if (!user) return;

  const existingProfile = await prisma.talentProfile.findUnique({ where: { userId: user.id } });
  if (existingProfile) return existingProfile;

  return prisma.talentProfile.create({
    data: {
      userId: user.id,
      performerTitle: 'Test Talent',
      bio: 'Automated test talent profile used for QA.',
      location: 'Test City',
      experienceLevel: '1 year',
      viewCount: 0,
      likeCount: 0,
      profileComplete: true,
      age: 28,
      gender: 'PREFER_NOT_TO_SAY',
    },
  });
}

async function main() {
  console.log('🌱 Seeding admin and test accounts...');

  const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@example.com';
  const adminName = process.env.TEST_ADMIN_NAME || 'Admin';
  const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'adminpass';

  const testEmail = process.env.TEST_USER_EMAIL || 'tester@example.com';
  const testName = process.env.TEST_USER_NAME || 'Test User';
  const testPassword = process.env.TEST_USER_PASSWORD || 'testpass';

  const admin = await ensureUser(adminEmail, adminName, adminPassword, 'ADMIN');
  const tester = await ensureUser(testEmail, testName, testPassword, 'TALENT');

  await ensureTesterProfile(tester);

  console.log('✅ Admin and test accounts ensured.');

  // Disconnect Prisma before spawning child process to avoid multiple clients in same process
  await prisma.$disconnect();

  console.log('🎬 Running generate-500-talents.mjs (with TOTAL_TALENTS defaulting to 150)...');

  const env = {
    ...process.env,
    // allow override but default to 150
    TOTAL_TALENTS: process.env.TOTAL_TALENTS || '150',
  };

  const scriptPath = resolve(__dirname, 'generate-500-talents.mjs');

  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      env,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`generate-500-talents.mjs exited with code ${code}`));
      }
    });
  });

  console.log('✅ Admin/test seeding + talent generation complete.');
}

main()
  .catch((e) => {
    console.error('Fatal error in seed-admin-and-talents.mjs:', e);
    process.exit(1);
  });
