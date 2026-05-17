import { useEffect, useState, useMemo } from 'react';
import { courseService, Course } from '../../services/courseService';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  BookOpen,
  Layout,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { CourseForm } from './CourseForm';
import { CourseContentEditor } from './CourseContentEditor';
import toast from 'react-hot-toast';

export function AdminCourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isContentEditorOpen, setIsContentEditorOpen] = useState(false);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [managingCourseId, setManagingCourseId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await courseService.getAll();
      setCourses(response.data.data);
    } catch (err) {
      toast.error('Failed to sync course catalog');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      const loadingToast = toast.loading('Deleting course...');
      try {
        await courseService.delete(id);
        setCourses(courses.filter(c => c.id !== id));
        toast.success('Course deleted successfully', { id: loadingToast });
      } catch (err) {
        toast.error('Failed to delete course', { id: loadingToast });
      }
    }
  };

  const toggleStatus = async (course: Course) => {
    const loadingToast = toast.loading('Updating status...');
    try {
      await courseService.update(course.id, { isActive: !course.isActive });
      setCourses(courses.map(c => c.id === course.id ? { ...c, isActive: !c.isActive } : c));
      toast.success(`Course ${course.isActive ? 'deactivated' : 'activated'}`, { id: loadingToast });
    } catch (err) {
      toast.error('Failed to update status', { id: loadingToast });
    }
  };

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(editingCourse ? 'Updating course...' : 'Creating course...');
    try {
      if (editingCourse) {
        const response = await courseService.update(editingCourse.id, formData);
        setCourses(courses.map(c => c.id === editingCourse.id ? response.data.data : c));
        toast.success('Course updated successfully', { id: loadingToast });
      } else {
        const response = await courseService.create(formData);
        setCourses([response.data.data, ...courses]);
        toast.success('New course created', { id: loadingToast });
      }
      setIsModalOpen(false);
      setEditingCourse(null);
    } catch (err: any) {
      const errors = err.response?.data?.meta?.errors;
      const errorMsg = errors
        ? Object.values(errors).join(', ')
        : err.response?.data?.message || 'Failed to save course. Please check your data.';
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses
      .filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' ||
          (statusFilter === 'ACTIVE' && c.isActive) ||
          (statusFilter === 'INACTIVE' && !c.isActive);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [courses, searchQuery, statusFilter]);

  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-text-secondary font-bold animate-pulse">Syncing catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Course Management</h1>
          <p className="text-text-secondary mt-1 font-medium">Create, edit, and manage your educational content</p>
        </div>

        <button
          onClick={() => {
            setEditingCourse(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-hover hover:-translate-y-1 transition-all shadow-premium shadow-primary/20 active:translate-y-0"
        >
          <Plus size={20} />
          Create New Course
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-border shadow-premium flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-3 bg-surface border border-border px-4 py-2.5 rounded-2xl w-full md:flex-1 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
          <Search size={18} className="text-text-secondary" />
          <input
            type="text"
            placeholder="Search by title or description..."
            className="bg-transparent border-none outline-none text-sm w-full font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            className="px-4 py-2.5 bg-white border border-border rounded-2xl text-sm font-bold text-text-secondary hover:bg-surface outline-none transition-all cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <EmptyState
          title={searchQuery || statusFilter !== 'ALL' ? "No matches found" : "No courses found"}
          description={searchQuery || statusFilter !== 'ALL' ? "Try adjusting your filters or search terms." : "You haven't created any courses yet. Start by adding your first one!"}
          icon={BookOpen}
          actionText={searchQuery || statusFilter !== 'ALL' ? "Reset Filters" : "Create Course"}
          onAction={() => {
            if (searchQuery || statusFilter !== 'ALL') {
              setSearchQuery('');
              setStatusFilter('ALL');
            } else {
              setIsModalOpen(true);
            }
          }}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-border shadow-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/50 border-b border-border">
                  <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Course Details</th>
                  <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-1">
                      Created <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-surface/30 transition-colors group/row"
                    onPointerEnter={() => setHoveredRowId(course.id)}
                    onPointerLeave={() => setHoveredRowId(null)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-20 aspect-video rounded-xl bg-surface border border-border overflow-hidden shrink-0 shadow-sm transition-colors ${hoveredRowId === course.id ? 'border-primary/50' : ''}`}>
                          {course.thumbnailUrl ? (
                            <img
                              src={course.thumbnailUrl}
                              alt={course.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/f8fafc/64748b?text=Course';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-secondary">
                              <ImageIcon size={24} className="opacity-20" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text-primary truncate">{course.title}</p>
                          <p className="text-xs text-text-secondary font-medium line-clamp-1">{course.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => toggleStatus(course)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${course.isActive
                          ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
                          : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                          }`}
                      >
                        {course.isActive ? (
                          <><CheckCircle size={12} /> Active</>
                        ) : (
                          <><XCircle size={12} /> Inactive</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-text-secondary">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-primary/40" />
                        {new Date(course.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right min-w-[200px]">
                      <div className="flex items-center justify-end gap-2 transition-all duration-300 opacity-0 group-hover/row:opacity-100 pointer-events-none group-hover/row:pointer-events-auto">
                        <button
                          onClick={() => {
                            setManagingCourseId(course.id);
                            setIsContentEditorOpen(true);
                          }}
                          className="p-2 text-text-secondary hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                          title="Manage Content"
                        >
                          <Layout size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setViewingCourse(course);
                            setIsPreviewOpen(true);
                          }}
                          className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCourse(course);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-text-secondary hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
      >
        <CourseForm
          course={editingCourse}
          isSubmitting={isSubmitting}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      </Modal>

      {/* Content Editor Modal */}
      <Modal
        isOpen={isContentEditorOpen}
        onClose={() => setIsContentEditorOpen(false)}
        title="Course Curriculum Manager"
      >
        {managingCourseId && (
          <CourseContentEditor
            courseId={managingCourseId}
            onClose={() => setIsContentEditorOpen(false)}
          />
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Course Preview"
      >
        {viewingCourse && (
          <div className="space-y-6">
            <div className="aspect-video w-full rounded-3xl overflow-hidden border border-border shadow-inner bg-surface">
              {viewingCourse.thumbnailUrl ? (
                <img src={viewingCourse.thumbnailUrl} alt={viewingCourse.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen size={48} className="text-primary/20" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-black text-text-primary tracking-tight">{viewingCourse.title}</h4>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${viewingCourse.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                  {viewingCourse.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mt-4 text-text-secondary font-medium leading-relaxed">{viewingCourse.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 p-6 bg-surface rounded-3xl border border-border">
              <div>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Created On</p>
                <p className="text-sm font-bold text-text-primary mt-1">{new Date(viewingCourse.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Modules</p>
                <p className="text-sm font-bold text-text-primary mt-1">{viewingCourse._count?.sections || 0} modules synced</p>
              </div>
            </div>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
            >
              Close Preview
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
