import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { removeDirectory } from '../../shared/utils/file-cleanup';
import { env } from '../../config/env';
import path from 'path';
import type { CreateSectionInput, UpdateSectionInput, ReorderSectionsInput } from './section.validators';

async function verifyCourseExists(courseId: string): Promise<void> {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw AppError.notFound('Course');
  }
}

export async function createSection(courseId: string, input: CreateSectionInput) {
  await verifyCourseExists(courseId);

  return prisma.section.create({
    data: {
      title: input.title,
      sortOrder: input.sortOrder,
      courseId,
    },
  });
}

export async function listSections(courseId: string) {
  await verifyCourseExists(courseId);

  return prisma.section.findMany({
    where: { courseId },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { contentItems: true } },
    },
  });
}

export async function updateSection(courseId: string, sectionId: string, input: UpdateSectionInput) {
  const section = await prisma.section.findFirst({
    where: { id: sectionId, courseId },
  });

  if (!section) {
    throw AppError.notFound('Section');
  }

  return prisma.section.update({
    where: { id: sectionId },
    data: input,
  });
}

export async function deleteSection(courseId: string, sectionId: string) {
  const section = await prisma.section.findFirst({
    where: { id: sectionId, courseId },
    include: { contentItems: true },
  });

  if (!section) {
    throw AppError.notFound('Section');
  }

  await prisma.section.delete({ where: { id: sectionId } });

  const sectionDir = path.join(env.UPLOAD_DIR, 'courses', courseId, sectionId);
  await removeDirectory(sectionDir);

  return section;
}

export async function reorderSections(courseId: string, input: ReorderSectionsInput) {
  await verifyCourseExists(courseId);

  await prisma.$transaction(
    input.orderedIds.map((id, index) =>
      prisma.section.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  return prisma.section.findMany({
    where: { courseId },
    orderBy: { sortOrder: 'asc' },
  });
}
