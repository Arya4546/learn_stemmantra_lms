import { Role } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { hashPassword } from '../../shared/utils/hash';
import type { CreateUserInput, UpdateUserInput, PaginationQuery } from './user.validators';

const USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function createStudent(input: CreateUserInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw AppError.conflict(`User with email '${input.email}' already exists`);
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      role: Role.STUDENT,
    },
    select: USER_SELECT,
  });
}

export async function listStudents(query: PaginationQuery) {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const [students, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.STUDENT },
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: { role: Role.STUDENT } }),
  ]);

  return {
    students,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getStudentById(userId: string) {
  const student = await prisma.user.findUnique({
    where: { id: userId, role: Role.STUDENT },
    select: {
      ...USER_SELECT,
      enrollments: {
        include: {
          course: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  });

  if (!student) {
    throw AppError.notFound('Student');
  }

  return student;
}

export async function updateStudent(userId: string, input: UpdateUserInput) {
  const student = await prisma.user.findUnique({
    where: { id: userId, role: Role.STUDENT },
  });

  if (!student) {
    throw AppError.notFound('Student');
  }

  if (input.email && input.email !== student.email) {
    const conflict = await prisma.user.findUnique({ where: { email: input.email } });
    if (conflict) {
      throw AppError.conflict(`Email '${input.email}' is already in use`);
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: input,
    select: USER_SELECT,
  });
}

export async function deactivateStudent(userId: string) {
  const student = await prisma.user.findUnique({
    where: { id: userId, role: Role.STUDENT },
  });

  if (!student) {
    throw AppError.notFound('Student');
  }

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    select: USER_SELECT,
  });
}
