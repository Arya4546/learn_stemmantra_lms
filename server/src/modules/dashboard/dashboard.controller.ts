import type { Request, Response } from 'express';
import * as dashboardService from './dashboard.service';
import { sendSuccess } from '../../shared/utils/response';
import { HttpStatus } from '../../shared/errors/app-error';

export async function getAdminDashboard(req: Request, res: Response): Promise<void> {
  const data = await dashboardService.getAdminStats();
  sendSuccess(res, HttpStatus.OK, 'Admin dashboard data retrieved', data);
}

export async function getStudentDashboard(req: Request, res: Response): Promise<void> {
  const data = await dashboardService.getStudentStats(req.user!.userId);
  sendSuccess(res, HttpStatus.OK, 'Student dashboard data retrieved', data);
}
