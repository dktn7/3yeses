#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@local.test';
  const password = 'P@ssw0rd123!';
  const name = 'Local Admin';

  // Only set the password on create to avoid re-hashing on every run
  const id = randomUUID();
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: 'ADMIN',
    },
    create: {
      id,
      email,
      password: hashed,
      name,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log('Upserted admin user:');
  console.log({ id: user.id, email: user.email, role: user.role });
  console.log('Credentials:');
  console.log({ email, password });
}

main()
  .catch((e) => {
    console.error('Error upserting admin:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
