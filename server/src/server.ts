import { createApp } from './app';
// Fix for BigInt serialization issue in JSON
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
import { prisma } from './database/prisma';
import { seedAdmin } from '../prisma/seed';
import { cleanupExpiredTokens } from './shared/utils/content-token';
import { env } from './config/env';
import { logger } from './config/logger';

const CLEANUP_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    await seedAdmin(prisma);

    const app = createApp();

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    // Periodic cleanup of expired content access tokens
    setInterval(async () => {
      const cleaned = await cleanupExpiredTokens();
      if (cleaned > 0) {
        logger.info(`Cleaned up ${cleaned} expired content access tokens`);
      }
    }, CLEANUP_INTERVAL_MS);

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      await prisma.$disconnect();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', { error });
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
