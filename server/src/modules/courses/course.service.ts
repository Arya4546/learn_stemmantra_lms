import { Role } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { removeDirectory } from '../../shared/utils/file-cleanup';
import { env } from '../../config/env';
import path from 'path';
import type { CreateCourseInput, UpdateCourseInput } from './course.validators';
import type { PaginationQuery } from '../users/user.validators';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 0;

  while (true) {
    const existing = await prisma.course.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

export async function createCourse(input: CreateCourseInput) {
  const slug = await ensureUniqueSlug(generateSlug(input.title));

  return prisma.course.create({
    data: {
      title: input.title,
      description: input.description,
      slug,
      thumbnailUrl: input.thumbnailUrl,
      price: input.price,
      isActive: input.isActive,
      isPublished: input.isPublished,
    },
  });
}

export async function listCourses(userId: string, userRole: Role, query: PaginationQuery) {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const whereClause =
    userRole === Role.ADMIN
      ? {}
      : {
          isActive: true,
          isPublished: true,
          enrollments: { some: { userId } },
        };

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        thumbnailUrl: true,
        price: true,
        isActive: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { sections: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.course.count({ where: whereClause }),
  ]);

  return {
    courses,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getCourseById(courseId: string, userId: string, userRole: Role) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      sections: {
        orderBy: { sortOrder: 'asc' },
        include: {
          contentItems: {
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              title: true,
              type: true,
              mimeType: true,
              fileSize: true,
              sortOrder: true,
              createdAt: true,
            },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    throw AppError.notFound('Course');
  }

  if (userRole === Role.STUDENT) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) {
      throw AppError.forbidden('You are not enrolled in this course');
    }
  }

  return course;
}

export async function updateCourse(courseId: string, input: UpdateCourseInput) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw AppError.notFound('Course');
  }

  const updateData: Record<string, unknown> = { ...input };

  if (input.title && input.title !== course.title) {
    updateData.slug = await ensureUniqueSlug(generateSlug(input.title), courseId);
  }

  return prisma.course.update({
    where: { id: courseId },
    data: updateData,
  });
}

export async function deleteCourse(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { sections: { include: { contentItems: true } } },
  });

  if (!course) {
    throw AppError.notFound('Course');
  }

  await prisma.course.delete({ where: { id: courseId } });

  const courseDir = path.join(env.UPLOAD_DIR, 'courses', courseId);
  await removeDirectory(courseDir);

  return course;
}
