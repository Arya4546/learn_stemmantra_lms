import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseService, Course } from '../../services/courseService';
import { PlayCircle, FileText, Image as ImageIcon, ChevronLeft, Clock, BookOpen, ShieldCheck, Users } from 'lucide-react';

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await courseService.getById(id!);
        setCourse(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load course details.');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchCourseData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto pb-12 animate-pulse">
        <div className="w-32 h-4 bg-gray-200 rounded mb-6"></div>
        <div className="bg-white rounded-xl border border-border p-8 mb-8 shadow-sm">
          <div className="h-8 w-2/3 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-6">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-border overflow-hidden h-32"></div>
          ))}
        </div>
      </div>
    );
  }
  if (error || !course) return <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-100 font-medium">{error || 'Course not found'}</div>;

  const getIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <PlayCircle size={18} className="text-blue-500" />;
      case 'PDF': return <FileText size={18} className="text-red-500" />;
      case 'IMAGE': return <ImageIcon size={18} className="text-green-500" />;
      default: return <FileText size={18} className="text-gray-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <Link to="/student/courses" className="group inline-flex items-center text-sm font-bold text-text-secondary hover:text-primary transition-all">
        <div className="p-1.5 bg-white border border-border rounded-lg mr-3 group-hover:border-primary group-hover:bg-primary/5 transition-all">
          <ChevronLeft size={16} />
        </div>
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-3xl border border-border p-10 shadow-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldCheck size={120} className="text-primary" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-[10px] mb-4 bg-primary/5 w-fit px-3 py-1 rounded-full border border-primary/10">
            <BookOpen size={12} />
            Course Overview
          </div>
          <h1 className="text-4xl font-black text-text-primary mb-4 tracking-tight leading-tight">
            {course.title}
          </h1>
          <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-3xl">
            {course.description || "No description provided for this course. Start your learning journey today with our curated content."}
          </p>
          
          <div className="flex flex-wrap items-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-text-secondary font-bold text-sm">
              <Clock size={16} className="text-primary" />
              {course.sections?.length || 0} Modules
            </div>
            <div className="w-1 h-1 bg-border rounded-full" />
            <div className="flex items-center gap-2 text-text-secondary font-bold text-sm">
              <Users size={16} className="text-primary" />
              Active Enrollment
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">Curriculum</h2>
          <span className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] bg-surface px-4 py-2 rounded-xl border border-border shadow-sm">
            {course.sections?.length || 0} Sections
          </span>
        </div>
        
        {(!course.sections || course.sections.length === 0) ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-border shadow-sm">
            <PlayCircle className="mx-auto h-16 w-16 text-gray-200 mb-6" />
            <p className="text-text-secondary text-lg font-bold">No curriculum content available yet.</p>
          </div>
        ) : (
          course.sections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-3xl border border-border overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300">
              <div className="bg-surface/50 px-8 py-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-border flex items-center justify-center text-primary font-black text-sm shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-text-primary tracking-tight">
                      {section.title}
                    </h3>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-0.5">
                      {section.contentItems?.length || 0} Lessons &middot; Part {index + 1}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-border">
                {(!section.contentItems || section.contentItems.length === 0) ? (
                  <div className="px-8 py-6 text-sm text-text-secondary font-medium italic bg-surface/20">No content in this section.</div>
                ) : (
                  section.contentItems.map((content) => (
                    <Link
                      key={content.id}
                      to={`/student/content/${content.id}`}
                      className="flex items-center justify-between px-8 py-5 hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm group-hover:border-primary group-hover:bg-white group-hover:shadow-premium transition-all">
                          {getIcon(content.type)}
                        </div>
                        <div>
                          <span className="text-base font-bold text-text-primary group-hover:text-primary transition-colors block">
                            {content.title}
                          </span>
                          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                            {content.type} Lesson
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <span className="text-xs font-black text-primary uppercase tracking-widest">
                          Start
                        </span>
                        <PlayCircle size={16} className="text-primary" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
