import { prisma } from '../../database/prisma';
import { Role } from '@prisma/client';

export async function getAdminStats() {
  const [studentCount, courseCount, enrollmentCount, recentEnrollments, recentStudents] = await Promise.all([
    prisma.user.count({ where: { role: Role.STUDENT } }),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.enrollment.findMany({
      take: 5,
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true } },
        course: { select: { title: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: Role.STUDENT },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { fullName: true, email: true, createdAt: true },
    }),
  ]);

  // Group enrollments by course for a simple "popularity" chart
  const coursePerformance = await prisma.enrollment.groupBy({
    by: ['courseId'],
    _count: { _all: true },
    orderBy: { _count: { courseId: 'desc' } },
    take: 5,
  });

  // Fetch course titles for the chart
  const performanceWithTitles = await Promise.all(
    coursePerformance.map(async (item) => {
      const course = await prisma.course.findUnique({
        where: { id: item.courseId },
        select: { title: true },
      });
      return {
        title: course?.title || 'Unknown',
        count: item._count._all,
      };
    })
  );

  return {
    stats: {
      totalStudents: studentCount,
      totalCourses: courseCount,
      totalEnrollments: enrollmentCount,
    },
    recentEnrollments,
    recentStudents,
    coursePerformance: performanceWithTitles,
  };
}

export async function getStudentStats(userId: string) {
  const [enrollments, accessLogs] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            _count: { select: { sections: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    }),
    prisma.contentAccessLog.findMany({
      where: { userId },
      take: 10,
      orderBy: { accessedAt: 'desc' },
      include: {
        contentItem: {
          select: { title: true, type: true, section: { select: { courseId: true } } },
        },
      },
    }),
  ]);

  // Simple progress estimation: (accessed unique items / total items in course)
  // For now, we'll just return a placeholder or simple count
  const stats = {
    enrolledCourses: enrollments.length,
    completedLessons: accessLogs.length, // Rough proxy
    learningPoints: accessLogs.length * 10, // Placeholder logic
  };

  return {
    stats,
    enrollments,
    recentActivity: accessLogs.map(log => ({
      id: log.id,
      title: log.contentItem.title,
      type: log.contentItem.type,
      courseId: log.contentItem.section.courseId,
      at: log.accessedAt,
    })),
  };
}
