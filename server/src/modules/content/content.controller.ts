import type { Request, Response } from 'express';
import * as contentService from './content.service';
import { validateAndConsumeContentToken } from '../../shared/utils/content-token';
import { validateReferer, streamVideo, serveInline } from './content.streaming';
import { sendSuccess } from '../../shared/utils/response';
import { HttpStatus, AppError } from '../../shared/errors/app-error';
import type { UploadContentBody } from './content.validators';

export async function uploadContent(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw AppError.badRequest('No file uploaded');
  }

  const { title } = req.body as UploadContentBody;
  const sectionId = String(req.params.sectionId);

  const contentItem = await contentService.uploadContent(sectionId, title, req.file);

  sendSuccess(res, HttpStatus.CREATED, 'Content uploaded', {
    id: contentItem.id,
    title: contentItem.title,
    type: contentItem.type,
    mimeType: contentItem.mimeType,
    fileSize: contentItem.fileSize.toString(),
  });
}

export async function listContent(req: Request, res: Response): Promise<void> {
  const items = await contentService.listContentItems(String(req.params.sectionId));

  const serialized = items.map((item) => ({
    ...item,
    fileSize: item.fileSize.toString(),
  }));

  sendSuccess(res, HttpStatus.OK, 'Content items retrieved', serialized);
}

export async function deleteContent(req: Request, res: Response): Promise<void> {
  await contentService.deleteContentItem(String(req.params.id));
  sendSuccess(res, HttpStatus.OK, 'Content item deleted', null);
}
export async function generateAccessToken(req: Request, res: Response): Promise<void> {
  const { token, contentItem } = await contentService.requestContentAccessToken(
    String(req.params.id),
    req.user!.userId,
    req.user!.role,
  );

  sendSuccess(res, HttpStatus.CREATED, 'Content access token generated', { 
    token,
    type: contentItem.type,
    mimeType: contentItem.mimeType,
    title: contentItem.title
  });
}

export async function serveContent(req: Request, res: Response): Promise<void> {
  validateReferer(req);

  const tokenData = await validateAndConsumeContentToken(String(req.params.token));

  await contentService.logContentAccess(
    tokenData.userId,
    tokenData.contentItemId,
    req.ip || 'unknown',
    req.get('user-agent') || 'unknown',
  );

  const { mimeType, filePath } = tokenData;

  if (mimeType.startsWith('video/')) {
    streamVideo(req, res, filePath, mimeType);
  } else {
    serveInline(res, filePath, mimeType);
  }
}
