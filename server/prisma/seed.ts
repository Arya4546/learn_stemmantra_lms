/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import { seedAdmin } from '../src/database/seed';

const prisma = new PrismaClient();
seedAdmin(prisma)
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
