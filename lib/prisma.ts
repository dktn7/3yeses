import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Connection pool configuration for production
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
    // Connection pool settings via datasource URL params:
    // ?connection_limit=10&pool_timeout=30
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export function getPrisma(): PrismaClient {
  return prisma;
}

export default prisma;

