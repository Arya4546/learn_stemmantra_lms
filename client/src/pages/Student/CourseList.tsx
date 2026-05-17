import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentService } from '../../services/enrollmentService';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Search } from 'lucide-react';

export function CourseList() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) return;
      try {
        const response = await enrollmentService.getMyEnrollments(user.id);
        // Map enrollments to the course objects inside them
        const enrolledCourses = response.data.data.map((e: any) => ({
          ...e.course,
          enrolledAt: e.enrolledAt
        }));
        setCourses(enrolledCourses);
      } catch (err) {
        setError('Failed to load your courses.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="h-40 bg-gray-100"></div>
              <div className="p-6">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-100 rounded mb-1"></div>
                <div className="h-4 w-2/3 bg-gray-100 rounded mb-4"></div>
                <div className="flex justify-between mt-4">
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-100 font-medium">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">My Courses</h1>
          <p className="text-text-secondary mt-1 font-medium">Continue where you left off</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white border border-border px-4 py-2.5 rounded-2xl w-full md:max-w-xs focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
          <Search size={18} className="text-text-secondary" />
          <input 
            type="text" 
            placeholder="Search my courses..." 
            className="bg-transparent border-none outline-none text-sm w-full font-medium"
          />
        </div>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-border shadow-sm">
          <BookOpen className="mx-auto h-16 w-16 text-gray-200 mb-6" />
          <h3 className="text-2xl font-bold text-text-primary mb-2">No courses found</h3>
          <p className="text-text-secondary max-w-sm mx-auto font-medium">You haven't been enrolled in any courses yet. Once assigned, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Link 
              key={course.id} 
              to={`/student/courses/${course.id}`}
              className="group bg-white rounded-3xl border border-border overflow-hidden shadow-premium hover:shadow-premium-hover hover:border-primary/30 transition-all duration-300 flex flex-col"
            >
              <div className="h-48 bg-surface overflow-hidden relative">
                {course.thumbnailUrl ? (
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                    <BookOpen size={48} className="text-primary/30" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-text-primary shadow-premium border border-white/50">
                  {course._count?.sections || 0} Modules
                </div>
              </div>
              <div className="p-7 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-text-primary mb-3 line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
                  {course.title}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-2 mb-6 flex-1 font-medium leading-relaxed">
                  {course.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                  <span className="text-sm font-bold text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                    Resume Course
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
