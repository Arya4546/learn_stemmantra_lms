import { api } from './api';

export const dashboardService = {
  getAdminStats: () => api.get('/dashboard/admin'),
  getStudentStats: () => api.get('/dashboard/student'),
};
