import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { corsOptions } from './config/cors';
import { globalLimiter } from './config/rate-limit';
import { requestLogger } from './shared/middleware/request-logger';
import { globalErrorHandler } from './shared/middleware/error-handler';
import { notFoundHandler } from './shared/middleware/not-found';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/user.routes';
import { courseRoutes } from './modules/courses/course.routes';
import { sectionRoutes } from './modules/sections/section.routes';
import { contentRoutes } from './modules/content/content.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { enrollmentRoutes } from './modules/enrollments/enrollment.routes';

export function createApp(): express.Application {
  const app = express();

  // Security & parsing
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Handled per-route for content serving
  }));
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // Global rate limiter + request logging
  app.use(globalLimiter);
  app.use(requestLogger);

  // Trust proxy for correct IP behind reverse proxy
  app.set('trust proxy', 1);

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/courses/:courseId/sections', sectionRoutes);
  app.use('/api', contentRoutes);
  app.use('/api/enrollments', enrollmentRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Stem Mantra LMS API is running', data: null });
  });

  // Catch-all & error handling
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
