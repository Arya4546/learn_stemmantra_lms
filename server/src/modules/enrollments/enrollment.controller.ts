import type { Request, Response } from 'express';
import * as enrollmentService from './enrollment.service';
import { sendSuccess } from '../../shared/utils/response';
import { HttpStatus } from '../../shared/errors/app-error';
import type { CreateEnrollmentInput } from './enrollment.validators';

export async function enroll(req: Request, res: Response): Promise<void> {
  const enrollment = await enrollmentService.enrollStudent(req.body as CreateEnrollmentInput);
  sendSuccess(res, HttpStatus.CREATED, 'Student enrolled', enrollment);
}

export async function unenroll(req: Request, res: Response): Promise<void> {
  await enrollmentService.unenrollStudent(req.body as CreateEnrollmentInput);
  sendSuccess(res, HttpStatus.OK, 'Student unenrolled', null);
}

export async function listByCourse(req: Request, res: Response): Promise<void> {
  const enrollments = await enrollmentService.listEnrolledStudents(String(req.params.courseId));
  sendSuccess(res, HttpStatus.OK, 'Enrolled students retrieved', enrollments);
}

export async function listByUser(req: Request, res: Response): Promise<void> {
  const enrollments = await enrollmentService.listStudentCourses(String(req.params.userId));
  sendSuccess(res, HttpStatus.OK, 'Student courses retrieved', enrollments);
}
