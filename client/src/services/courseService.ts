import { api } from './api';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  price: number;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  sections?: Section[];
  _count?: {
    sections: number;
  };
}

export interface Section {
  id: string;
  title: string;
  sortOrder: number;
  contentItems: Content[];
}

export interface Content {
  id: string;
  title: string;
  type: 'VIDEO' | 'PDF' | 'IMAGE';
  url: string;
  mimeType: string;
  fileSize: string;
  sortOrder: number;
}

export const courseService = {
  getAll: () => api.get('/courses'),
  getById: (id: string) => api.get(`/courses/${id}`),
  create: (data: Partial<Course>) => api.post('/courses', data),
  update: (id: string, data: Partial<Course>) => api.patch(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
};
