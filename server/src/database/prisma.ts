import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('error', (event) => {
  logger.error('Prisma error', { target: event.target, message: event.message });
});

prisma.$on('warn', (event) => {
  logger.warn('Prisma warning', { target: event.target, message: event.message });
});

export { prisma };
