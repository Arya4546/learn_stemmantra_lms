import type { Request, Response } from 'express';
import * as userService from './user.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';
import { HttpStatus } from '../../shared/errors/app-error';
import type { CreateUserInput, UpdateUserInput, PaginationQuery } from './user.validators';

export async function createStudent(req: Request, res: Response): Promise<void> {
  const student = await userService.createStudent(req.body as CreateUserInput);
  sendSuccess(res, HttpStatus.CREATED, 'Student account created', student);
}

export async function listStudents(_req: Request, res: Response): Promise<void> {
  const query = res.locals.validatedQuery as PaginationQuery;
  const { students, pagination } = await userService.listStudents(query);
  sendPaginated(res, 'Students retrieved', students, pagination);
}

export async function getStudent(req: Request, res: Response): Promise<void> {
  const student = await userService.getStudentById(String(req.params.id));
  sendSuccess(res, HttpStatus.OK, 'Student retrieved', student);
}

export async function updateStudent(req: Request, res: Response): Promise<void> {
  const student = await userService.updateStudent(String(req.params.id), req.body as UpdateUserInput);
  sendSuccess(res, HttpStatus.OK, 'Student updated', student);
}

export async function deleteStudent(req: Request, res: Response): Promise<void> {
  const student = await userService.deactivateStudent(String(req.params.id));
  sendSuccess(res, HttpStatus.OK, 'Student deactivated', student);
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const user = await userService.updateMe(userId, req.body);
  sendSuccess(res, HttpStatus.OK, 'Profile updated successfully', user);
}

