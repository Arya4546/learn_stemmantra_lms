import type { Request, Response } from 'express';
import * as sectionService from './section.service';
import { sendSuccess } from '../../shared/utils/response';
import { HttpStatus } from '../../shared/errors/app-error';
import type { CreateSectionInput, UpdateSectionInput, ReorderSectionsInput } from './section.validators';

export async function createSection(req: Request, res: Response): Promise<void> {
  const section = await sectionService.createSection(String(req.params.courseId), req.body as CreateSectionInput);
  sendSuccess(res, HttpStatus.CREATED, 'Section created', section);
}

export async function listSections(req: Request, res: Response): Promise<void> {
  const sections = await sectionService.listSections(String(req.params.courseId));
  sendSuccess(res, HttpStatus.OK, 'Sections retrieved', sections);
}

export async function updateSection(req: Request, res: Response): Promise<void> {
  const section = await sectionService.updateSection(
    String(req.params.courseId),
    String(req.params.id),
    req.body as UpdateSectionInput,
  );
  sendSuccess(res, HttpStatus.OK, 'Section updated', section);
}

export async function deleteSection(req: Request, res: Response): Promise<void> {
  await sectionService.deleteSection(String(req.params.courseId), String(req.params.id));
  sendSuccess(res, HttpStatus.OK, 'Section deleted', null);
}

export async function reorderSections(req: Request, res: Response): Promise<void> {
  const sections = await sectionService.reorderSections(
    String(req.params.courseId),
    req.body as ReorderSectionsInput,
  );
  sendSuccess(res, HttpStatus.OK, 'Sections reordered', sections);
}
