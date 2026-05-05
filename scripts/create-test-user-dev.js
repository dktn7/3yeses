const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function run() {
  try {
    const plain = 'password123';
    const email = 'test+dev@example.com';
    const id = 'TN' + Math.floor(Math.random() * 900000 + 100000);
    const hashed = await bcrypt.hash(plain, 10);

    // Ensure the Postgres enum type for UserRole exists (Prisma expects it)
    try {
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname ILIKE 'userrole') THEN
            CREATE TYPE "UserRole" AS ENUM ('TALENT', 'ADMIN');
          END IF;
        END
        $$;
      `);
      console.log('Ensured enum "UserRole" exists (or already present)');
    } catch (enumErr) {
      console.error('ENUM_CREATE_ERROR', enumErr.message);
    }

    // If user exists, update password
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data: { password: hashed, emailVerified: new Date() } });
      console.log(JSON.stringify({ action: 'updated', id: existing.id, email, plainPassword: plain }, null, 2));
      return;
    }

    // Try create without role (let DB default handle role)
    try {
      const user = await prisma.user.create({
        data: {
          id,
          email,
          name: 'Test User',
          password: hashed,
          emailVerified: new Date(),
          settings: {}
        }
      });
      console.log(JSON.stringify({ action: 'created', id: user.id, email: user.email, plainPassword: plain }, null, 2));
      return;
    } catch (e) {
      console.error('PRISMA_CREATE_ERROR', e.message);
    }

    // Fallback: raw SQL insert bypassing Prisma enum typing
    try {
      await prisma.$executeRawUnsafe(
        'INSERT INTO "User" (id,email,name,password,"emailVerified",settings,"createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8)',
        id,
        email,
        'Test User',
        hashed,
        new Date(),
        JSON.stringify({}),
        new Date(),
        new Date()
      );
      console.log(JSON.stringify({ action: 'raw_inserted', id, email, plainPassword: plain }, null, 2));
      return;
    } catch (err2) {
      console.error('RAW_INSERT_ERROR', err2.message);
      process.exit(1);
    }

  } catch (err) {
    console.error('ERROR', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
