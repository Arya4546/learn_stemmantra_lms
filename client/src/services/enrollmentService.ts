import { api } from './api';

export const enrollmentService = {
  enroll: (userId: string, courseId: string) => api.post('/enrollments', { userId, courseId }),
  unenroll: (userId: string, courseId: string) => api.delete('/enrollments', { data: { userId, courseId } }),
  getByUser: (userId: string) => api.get(`/enrollments/user/${userId}`),
  getMyEnrollments: (userId: string) => api.get(`/enrollments/user/${userId}`),
  getByCourse: (courseId: string) => api.get(`/enrollments/course/${courseId}`),
};
