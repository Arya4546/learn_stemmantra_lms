import fs from 'fs/promises';
import { logger } from '../../config/logger';

export async function removeFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    logger.info('Cleaned up file', { filePath });
  } catch (error) {
    logger.warn('Failed to clean up file (may not exist)', {
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function removeDirectory(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
    logger.info('Cleaned up directory', { dirPath });
  } catch (error) {
    logger.warn('Failed to clean up directory', {
      dirPath,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function ensureDirectory(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function moveFile(source: string, destination: string): Promise<void> {
  await fs.rename(source, destination);
}
