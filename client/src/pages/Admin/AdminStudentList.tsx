import { useEffect, useState, useMemo } from 'react';
import { userService, User } from '../../services/userService';
import { courseService, Course } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { 
  Plus, 
  Search, 
  Mail, 
  User as UserIcon, 
  Shield, 
  Trash2,
  Calendar,
  Edit2,
  ArrowUpDown,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { StudentForm } from './StudentForm';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export function AdminStudentList() {
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [viewingStudent, setViewingStudent] = useState<User | null>(null);
  const [enrollingStudent, setEnrollingStudent] = useState<User | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm Dialog state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, coursesRes] = await Promise.all([
        userService.getAll(),
        courseService.getAll()
      ]);
      setStudents(usersRes.data.data.filter((u: User) => u.role === 'STUDENT'));
      setCourses(coursesRes.data.data);
    } catch (err) {
      toast.error('Failed to sync student directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleStatus = async (user: User) => {
    const loadingToast = toast.loading('Updating status...');
    try {
      await userService.updateUser(user.id, { isActive: !user.isActive });
      setStudents(students.map(s => s.id === user.id ? { ...s, isActive: !s.isActive } : s));
      toast.success(`Account ${user.isActive ? 'deactivated' : 'activated'}`, { id: loadingToast });
    } catch (err) {
      toast.error('Failed to update status', { id: loadingToast });
    }
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Remove Student',
      message: 'Are you sure you want to remove this student? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        const loadingToast = toast.loading('Removing student...');
        try {
          await userService.updateUser(id, { isActive: false }); 
          setStudents(students.filter(s => s.id !== id));
          toast.success('Student removed', { id: loadingToast });
        } catch (err) {
          toast.error('Failed to remove student', { id: loadingToast });
        }
      }
    });
  };

  const handleEnrollmentToggle = async (courseId: string) => {
    if (!enrollingStudent) return;
    const isEnrolled = studentEnrollments.includes(courseId);
    const loadingToast = toast.loading(isEnrolled ? 'Removing enrollment...' : 'Enrolling student...');
    
    try {
      if (isEnrolled) {
        await enrollmentService.unenroll(enrollingStudent.id, courseId);
        setStudentEnrollments(prev => prev.filter(id => id !== courseId));
        toast.success('Enrollment removed', { id: loadingToast });
      } else {
        await enrollmentService.enroll(enrollingStudent.id, courseId);
        setStudentEnrollments(prev => [...prev, courseId]);
        toast.success('Student enrolled successfully', { id: loadingToast });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update enrollment', { id: loadingToast });
    }
  };

  const openEnrollModal = async (student: User) => {
    setEnrollingStudent(student);
    const loadingToast = toast.loading('Fetching enrollments...');
    try {
      const res = await enrollmentService.getByUser(student.id);
      // Map existing enrollments to course IDs
      const enrolledCourseIds = res.data.data.map((e: any) => e.courseId);
      setStudentEnrollments(enrolledCourseIds);
      setIsEnrollModalOpen(true);
      toast.dismiss(loadingToast);
    } catch (err) {
      toast.error('Failed to fetch enrollments', { id: loadingToast });
    }
  };

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(editingStudent ? 'Updating profile...' : 'Adding student...');
    try {
      if (editingStudent) {
        const response = await userService.updateUser(editingStudent.id, formData);
        setStudents(students.map(s => s.id === editingStudent.id ? response.data.data : s));
        toast.success('Profile updated successfully', { id: loadingToast });
      } else {
        const response = await userService.createUser(formData);
        setStudents([response.data.data, ...students]);
        toast.success('New student registered', { id: loadingToast });
      }
      setIsModalOpen(false);
      setEditingStudent(null);
    } catch (err: any) {
      const errors = err.response?.data?.meta?.errors;
      const errorMsg = errors 
        ? Object.values(errors).join(', ') 
        : err.response?.data?.message || 'Failed to save student profile';
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             s.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || 
                             (statusFilter === 'ACTIVE' && s.isActive) || 
                             (statusFilter === 'INACTIVE' && !s.isActive);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [students, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-text-secondary font-bold animate-pulse">Loading directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Student Directory</h1>
          <p className="text-text-secondary mt-1 font-medium">Manage student access and view profiles</p>
        </div>
        
        <button 
          onClick={() => {
            setEditingStudent(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-hover hover:-translate-y-1 transition-all shadow-premium shadow-primary/20 active:translate-y-0"
        >
          <Plus size={20} />
          Add New Student
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-border shadow-premium flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-3 bg-surface border border-border px-4 py-2.5 rounded-2xl w-full md:flex-1 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
          <Search size={18} className="text-text-secondary" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
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
            <option value="ACTIVE">Active Students</option>
            <option value="INACTIVE">Inactive Students</option>
          </select>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <EmptyState 
          title={searchQuery || statusFilter !== 'ALL' ? "No matches found" : "No students found"}
          description={searchQuery || statusFilter !== 'ALL' ? "Try adjusting your search filters." : "You don't have any students registered yet."}
          icon={UserIcon}
          actionText={searchQuery || statusFilter !== 'ALL' ? "Reset Search" : "Add Student"}
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
                  <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Student</th>
                  <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-1">
                      Joined <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-surface/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0 border border-primary/5 shadow-inner">
                          {student.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text-primary truncate">{student.fullName}</p>
                          <div className="flex items-center gap-1.5 text-text-secondary">
                            <Mail size={12} />
                            <p className="text-xs font-medium truncate">{student.email}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => toggleStatus(student)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          student.isActive 
                            ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' 
                            : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                        }`}
                      >
                        {student.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                        <Calendar size={14} className="text-primary/40" />
                        {new Date(student.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEnrollModal(student)}
                          className="p-2 text-text-secondary hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all" 
                          title="Enroll Courses"
                        >
                          <BookOpen size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setViewingStudent(student);
                            setIsPreviewOpen(true);
                          }}
                          className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-xl transition-all" 
                          title="View Profile"
                        >
                          <Shield size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingStudent(student);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-text-secondary hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
                          title="Remove"
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
        title={editingStudent ? 'Edit Student Profile' : 'Add New Student'}
      >
        <StudentForm 
          student={editingStudent}
          isSubmitting={isSubmitting}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      </Modal>

      {/* Enrollment Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title={`Enrollments: ${enrollingStudent?.fullName}`}
      >
        <div className="space-y-6">
          <p className="text-sm text-text-secondary font-medium">Select the courses this student should have access to:</p>
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {courses.map(course => (
              <div 
                key={course.id}
                onClick={() => handleEnrollmentToggle(course.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                  studentEnrollments.includes(course.id)
                    ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20'
                    : 'bg-white border-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    studentEnrollments.includes(course.id) ? 'bg-primary text-white' : 'bg-surface text-text-secondary group-hover:text-primary'
                  }`}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{course.title}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                      {course.isActive ? 'Active Course' : 'Inactive'}
                    </p>
                  </div>
                </div>
                {studentEnrollments.includes(course.id) ? (
                  <CheckCircle2 className="text-primary" size={20} />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-border group-hover:border-primary/30" />
                )}
              </div>
            ))}
          </div>
          <button 
            onClick={() => setIsEnrollModalOpen(false)}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary-hover transition-all"
          >
            Done
          </button>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Student Profile Details"
      >
        {viewingStudent && (
          <div className="space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary font-black text-3xl border-2 border-primary/20 shadow-premium">
                {viewingStudent.fullName.charAt(0)}
              </div>
              <div>
                <h4 className="text-2xl font-black text-text-primary tracking-tight">{viewingStudent.fullName}</h4>
                <p className="text-text-secondary font-medium flex items-center justify-center gap-2 mt-1">
                  <Mail size={16} /> {viewingStudent.email}
                </p>
              </div>
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                viewingStudent.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {viewingStudent.isActive ? 'Active Account' : 'Inactive Account'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-surface rounded-3xl border border-border">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Member Since</p>
                <p className="text-sm font-bold text-text-primary mt-1">{new Date(viewingStudent.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="p-6 bg-surface rounded-3xl border border-border">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Enrolled Courses</p>
                <p className="text-sm font-bold text-text-primary mt-1">-- courses</p>
              </div>
            </div>

            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
            >
              Close Profile
            </button>
          </div>
        )}
      </Modal>

      {/* Custom Confirm Dialog */}
      {confirmConfig && (
        <ConfirmDialog
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig(null)}
          onConfirm={() => {
            confirmConfig.onConfirm();
            setConfirmConfig(null);
          }}
          title={confirmConfig.title}
          message={confirmConfig.message}
          isDestructive={confirmConfig.isDestructive}
        />
      )}
    </div>
  );
}
