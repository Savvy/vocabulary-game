import { PrismaClient } from '@prisma/client';
export * from './word-management';
export * from './dashboard-management';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export * from '@prisma/client'; 