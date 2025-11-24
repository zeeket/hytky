import type { PrismaClient } from '@prisma/client';

declare global {
  const jestPrisma: {
    client: PrismaClient;
  };
}

export {};

