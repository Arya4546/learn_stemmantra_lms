import { Role } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/app-error';
import type { CreateEnrollmentInput } from './enrollment.validators';

export async function enrollStudent(input: CreateEnrollmentInput) {
  const [user, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: input.userId } }),
    prisma.course.findUnique({ where: { id: input.courseId } }),
  ]);

  if (!user || user.role !== Role.STUDENT) {
    throw AppError.notFound('Student');
  }

  if (!user.isActive) {
    throw AppError.badRequest('Cannot enroll an inactive student');
  }

  if (!course) {
    throw AppError.notFound('Course');
  }

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: input.userId, courseId: input.courseId } },
  });

  if (existingEnrollment) {
    throw AppError.conflict('Student is already enrolled in this course');
  }

  return prisma.enrollment.create({
    data: {
      userId: input.userId,
      courseId: input.courseId,
    },
    include: {
      user: { select: { id: true, email: true, fullName: true } },
      course: { select: { id: true, title: true, slug: true } },
    },
  });
}

export async function unenrollStudent(input: CreateEnrollmentInput) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: input.userId, courseId: input.courseId } },
  });

  if (!enrollment) {
    throw AppError.notFound('Enrollment');
  }

  await prisma.enrollment.delete({
    where: { id: enrollment.id },
  });
}

export async function listEnrolledStudents(courseId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw AppError.notFound('Course');
  }

  return prisma.enrollment.findMany({
    where: { courseId },
    include: {
      user: { select: { id: true, email: true, fullName: true, isActive: true } },
    },
    orderBy: { enrolledAt: 'desc' },
  });
}

export async function listStudentCourses(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.notFound('User');
  }

  return prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: { 
        include: { 
          _count: { select: { sections: true } } 
        } 
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });
}
