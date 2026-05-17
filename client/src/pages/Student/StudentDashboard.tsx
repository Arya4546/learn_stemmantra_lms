import { BookOpen, Clock, Award, ChevronRight, PlayCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { Link } from 'react-router-dom';

export function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardService.getStudentStats();
        setData(response.data.data);
      } catch (err) {
        console.error('Failed to fetch student dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-64 bg-gray-900 rounded-[2.5rem]"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => <div key={i} className="h-48 bg-white rounded-3xl border border-border" />)}
            </div>
          </div>
          <div className="h-80 bg-white rounded-3xl border border-border"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="relative bg-gray-900 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-premium">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <Award size={12} />
            Ready to learn?
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Welcome back, <br />
            <span className="text-primary">{user?.fullName.split(' ')[0]}!</span>
          </h1>
          <p className="text-gray-400 text-lg font-medium leading-relaxed">
            You've completed {data?.stats.completedLessons || 0} lessons. Keep pushing to master your STEM skills!
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link to="/student/courses" className="bg-primary text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary-hover hover:-translate-y-1 transition-all shadow-lg shadow-primary/20 active:translate-y-0">
              Continue Learning
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Progress / Resume Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-text-primary tracking-tight">Recent Activity</h2>
            <Link to="/student/courses" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.enrollments.length === 0 ? (
              <div className="col-span-2 bg-white p-8 rounded-3xl border-2 border-dashed border-border text-center space-y-4">
                <BookOpen size={40} className="mx-auto text-gray-200" />
                <p className="text-text-secondary font-bold text-lg">No active courses yet</p>
                <Link to="/student/courses" className="text-primary font-black text-sm uppercase tracking-widest">Browse Catalog</Link>
              </div>
            ) : (
              data?.enrollments.slice(0, 2).map((enrollment: any) => (
                <div key={enrollment.id} className="group bg-white p-6 rounded-3xl border border-border shadow-premium hover:shadow-premium-hover transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] group-hover:bg-primary/10 transition-colors" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-primary shadow-inner border border-border/50 group-hover:scale-110 transition-transform">
                      <PlayCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-text-primary leading-tight line-clamp-1">{enrollment.course?.title}</h3>
                      <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-1">
                        {enrollment.course?._count.sections} Modules Available
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '10%' }} />
                      </div>
                      <Link to={`/student/courses/${enrollment.courseId}`} className="inline-block text-xs font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform">
                        Resume &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stats / Sidebar */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">Your Stats</h2>
          <div className="bg-white p-8 rounded-[2rem] border border-border shadow-premium space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                <Clock size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Lessons Viewed</p>
                <h4 className="text-2xl font-black text-text-primary">{data?.stats.completedLessons || 0}</h4>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                <Award size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Learning Points</p>
                <h4 className="text-2xl font-black text-text-primary">{data?.stats.learningPoints || 0}</h4>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
                <BookOpen size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Courses Enrolled</p>
                <h4 className="text-2xl font-black text-text-primary">{data?.stats.enrolledCourses || 0}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
