import { api } from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'STUDENT';
  isActive: boolean;
  createdAt: string;
}

export const userService = {
  getAll: () => api.get('/users'),
  getMe: () => api.get('/users/me'),
  updateProfile: (data: Partial<User>) => api.patch('/users/me', data),
  updateUser: (id: string, data: Partial<User>) => api.patch(`/users/${id}`, data),
  createUser: (data: any) => api.post('/users', data),
};
