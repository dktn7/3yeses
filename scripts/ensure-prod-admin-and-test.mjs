import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exitCode = 2;
    throw new Error(`Missing env var ${name}`);
  }
  return v;
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function ensureAdmin({ email, password, name }) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== 'ADMIN') {
      console.warn(`User with email ${email} exists but is not ADMIN. Skipping role change.`);
      // update password/emailVerified only
      await prisma.user.update({
        where: { email },
        data: {
          password: await hashPassword(password),
          name: name || existing.name,
          emailVerified: existing.emailVerified || new Date(),
        },
      });
      return;
    }

    // existing admin: ensure password and verified
    await prisma.user.update({
      where: { email },
      data: {
        password: await hashPassword(password),
        name: name || existing.name,
        emailVerified: existing.emailVerified || new Date(),
      },
    });
    console.log(`Updated ADMIN user: ${email}`);
    return;
  }

  await prisma.user.create({
    data: {
      id: randomUUID(),
      email,
      password: await hashPassword(password),
      name: name || 'Admin',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log(`Created ADMIN user: ${email}`);
}

async function ensureTestUser({ email, password, name, createProfile = false, createSubscription = false }) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== 'TALENT') {
      console.warn(`User with email ${email} exists and is not TALENT. Skipping role change.`);
    }

    await prisma.user.update({
      where: { email },
      data: {
        password: await hashPassword(password),
        name: name || existing.name,
        role: 'TALENT',
        emailVerified: existing.emailVerified || new Date(),
      },
    });
    console.log(`Updated test user: ${email}`);
  } else {
    await prisma.user.create({
      data: {
        id: randomUUID(),
        email,
        password: await hashPassword(password),
        name: name || 'Test User',
        role: 'TALENT',
        emailVerified: new Date(),
      },
    });
    console.log(`Created test user: ${email}`);
  }

  if (createProfile) {
    const user = await prisma.user.findUnique({ where: { email } });
    const existingProfile = await prisma.talentProfile.findUnique({ where: { userId: user.id } });
    if (!existingProfile) {
      await prisma.talentProfile.create({
        data: {
          userId: user.id,
          bio: 'Test account profile (minimal).',
          location: 'Unknown',
          profileComplete: true,
        },
      });
      console.log(`Created minimal TalentProfile for ${email}`);
    } else {
      console.log(`TalentProfile already exists for ${email}`);
    }
  }

  if (createSubscription) {
    const user = await prisma.user.findUnique({ where: { email } });
    const existingSub = await prisma.subscription.findFirst({ where: { userId: user.id } });
    if (!existingSub) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'STANDARD',
          status: 'ACTIVE',
          startDate: new Date(),
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
      });
      console.log(`Created ACTIVE subscription for ${email}`);
    } else {
      console.log(`Subscription already exists for ${email}`);
    }
  }
}

async function main() {
  try {
    const nodeEnv = process.env.NODE_ENV || 'development';

    const adminEmail = nodeEnv === 'production' ? requireEnv('PROD_ADMIN_EMAIL') : (process.env.PROD_ADMIN_EMAIL || process.env.TEST_ADMIN_EMAIL || 'admin@example.com');
    const adminPassword = nodeEnv === 'production' ? requireEnv('PROD_ADMIN_PASSWORD') : (process.env.PROD_ADMIN_PASSWORD || process.env.TEST_ADMIN_PASSWORD || 'adminpass');
    const adminName = process.env.PROD_ADMIN_NAME || process.env.TEST_ADMIN_NAME || 'Admin';

    const testEmail = nodeEnv === 'production' ? requireEnv('PROD_TEST_EMAIL') : (process.env.PROD_TEST_EMAIL || process.env.TEST_USER_EMAIL || 'tester@example.com');
    const testPassword = nodeEnv === 'production' ? requireEnv('PROD_TEST_PASSWORD') : (process.env.PROD_TEST_PASSWORD || process.env.TEST_USER_PASSWORD || 'testpass');
    const testName = process.env.PROD_TEST_NAME || process.env.TEST_USER_NAME || 'Test User';

    if (nodeEnv === 'production' && process.env.ALLOW_PROD_ADMIN_SEED !== 'true') {
      console.error('Refusing to run in production without ALLOW_PROD_ADMIN_SEED=true');
      process.exit(1);
    }

    const createProfile = process.env.CREATE_TEST_PROFILE === 'true';
    const createSubscription = process.env.CREATE_TEST_SUBSCRIPTION === 'true';

    await ensureAdmin({ email: adminEmail, password: adminPassword, name: adminName });
    await ensureTestUser({ email: testEmail, password: testPassword, name: testName, createProfile, createSubscription });

    console.log('Done.');
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

main();
