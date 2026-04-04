#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'talent1@test.com';
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      parentalConsentRequired: true,
      parentalConsentPending: true,
      parentalConsentGiven: true,
      resetToken: true,
    },
  });

  if (!user) {
    console.log('User not found:', email);
    process.exit(0);
  }

  console.log('User:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
