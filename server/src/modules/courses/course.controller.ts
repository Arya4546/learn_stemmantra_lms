import type { Request, Response } from 'express';
import * as courseService from './course.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';
import { HttpStatus } from '../../shared/errors/app-error';
import type { CreateCourseInput, UpdateCourseInput } from './course.validators';
import type { PaginationQuery } from '../users/user.validators';

export async function createCourse(req: Request, res: Response): Promise<void> {
  const course = await courseService.createCourse(req.body as CreateCourseInput);
  sendSuccess(res, HttpStatus.CREATED, 'Course created', course);
}

export async function listCourses(req: Request, res: Response): Promise<void> {
  const query = res.locals.validatedQuery as PaginationQuery;
  const { courses, pagination } = await courseService.listCourses(
    req.user!.userId,
    req.user!.role,
    query,
  );
  sendPaginated(res, 'Courses retrieved', courses, pagination);
}

export async function getCourse(req: Request, res: Response): Promise<void> {
  const course = await courseService.getCourseById(
    String(req.params.id),
    req.user!.userId,
    req.user!.role,
  );
  sendSuccess(res, HttpStatus.OK, 'Course retrieved', course);
}

export async function updateCourse(req: Request, res: Response): Promise<void> {
  const course = await courseService.updateCourse(String(req.params.id), req.body as UpdateCourseInput);
  sendSuccess(res, HttpStatus.OK, 'Course updated', course);
}

export async function deleteCourse(req: Request, res: Response): Promise<void> {
  await courseService.deleteCourse(String(req.params.id));
  sendSuccess(res, HttpStatus.OK, 'Course deleted', null);
}
