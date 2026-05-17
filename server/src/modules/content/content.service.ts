import path from 'path';
import { ContentType } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { env } from '../../config/env';
import { ensureDirectory, moveFile, removeFile } from '../../shared/utils/file-cleanup';
import { generateContentAccessToken } from '../../shared/utils/content-token';
import { logger } from '../../config/logger';

const MIME_TYPE_MAP: Record<string, ContentType> = {
  'video/mp4': ContentType.VIDEO,
  'video/webm': ContentType.VIDEO,
  'video/ogg': ContentType.VIDEO,
  'video/quicktime': ContentType.VIDEO,
  'application/pdf': ContentType.PDF,
  'image/jpeg': ContentType.IMAGE,
  'image/png': ContentType.IMAGE,
  'image/webp': ContentType.IMAGE,
  'image/gif': ContentType.IMAGE,
  'image/svg+xml': ContentType.IMAGE,
};

const CONTENT_TYPE_DIRS: Record<ContentType, string> = {
  [ContentType.VIDEO]: 'videos',
  [ContentType.PDF]: 'pdfs',
  [ContentType.IMAGE]: 'images',
};

function resolveContentType(mimeType: string): ContentType {
  const contentType = MIME_TYPE_MAP[mimeType];
  if (!contentType) {
    throw AppError.badRequest(
      `Unsupported file type: ${mimeType}. Allowed: ${Object.keys(MIME_TYPE_MAP).join(', ')}`,
    );
  }
  return contentType;
}

function getFileExtension(originalName: string): string {
  return path.extname(originalName).toLowerCase() || '.bin';
}

export async function uploadContent(
  sectionId: string,
  title: string,
  file: Express.Multer.File,
) {
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    select: { id: true, courseId: true },
  });

  if (!section) {
    await removeFile(file.path);
    throw AppError.notFound('Section');
  }

  const contentType = resolveContentType(file.mimetype);
  const extension = getFileExtension(file.originalname);
  const tempFilePath = file.path;

  let contentItem;

  try {
    contentItem = await prisma.contentItem.create({
      data: {
        title,
        type: contentType,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: BigInt(file.size),
        sectionId,
        filePath: '', // placeholder — updated after file move
      },
    });

    const typeDir = CONTENT_TYPE_DIRS[contentType];
    const finalDir = path.join(
      env.UPLOAD_DIR,
      'courses',
      section.courseId,
      sectionId,
      typeDir,
    );
    await ensureDirectory(finalDir);

    const finalPath = path.join(finalDir, `${contentItem.id}${extension}`);
    await moveFile(tempFilePath, finalPath);

    contentItem = await prisma.contentItem.update({
      where: { id: contentItem.id },
      data: { filePath: finalPath },
    });

    return contentItem;
  } catch (error) {
    await removeFile(tempFilePath);

    if (contentItem?.id) {
      await prisma.contentItem.delete({ where: { id: contentItem.id } }).catch(() => {
        logger.error('Failed to rollback content item record', { contentItemId: contentItem!.id });
      });
    }

    throw error;
  }
}

export async function listContentItems(sectionId: string) {
  const section = await prisma.section.findUnique({ where: { id: sectionId } });
  if (!section) {
    throw AppError.notFound('Section');
  }

  return prisma.contentItem.findMany({
    where: { sectionId },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      title: true,
      type: true,
      originalName: true,
      mimeType: true,
      fileSize: true,
      sortOrder: true,
      createdAt: true,
    },
  });
}

export async function deleteContentItem(contentItemId: string) {
  const contentItem = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
  });

  if (!contentItem) {
    throw AppError.notFound('Content item');
  }

  await prisma.contentItem.delete({ where: { id: contentItemId } });

  if (contentItem.filePath) {
    await removeFile(contentItem.filePath);
  }

  return contentItem;
}

export async function requestContentAccessToken(
  contentItemId: string,
  userId: string,
  userRole: string,
) {
  const contentItem = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
    include: {
      section: {
        select: { courseId: true },
      },
    },
  });

  if (!contentItem) {
    throw AppError.notFound('Content item');
  }

  if (userRole !== 'ADMIN') {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: contentItem.section.courseId,
        },
      },
    });

    if (!enrollment) {
      throw AppError.forbidden('You are not enrolled in this course');
    }
  }

  const token = await generateContentAccessToken(contentItemId, userId);
  return { token, contentItem };
}

export async function logContentAccess(
  userId: string,
  contentItemId: string,
  ipAddress: string,
  userAgent: string,
): Promise<void> {
  await prisma.contentAccessLog.create({
    data: {
      userId,
      contentItemId,
      ipAddress,
      userAgent,
    },
  });
}
