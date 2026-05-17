import { useState, useEffect } from 'react';
import { User } from '../../services/userService';
import { Eye, EyeOff, Lock, User as UserIcon, Mail } from 'lucide-react';

interface StudentFormProps {
  student?: User | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function StudentForm({ student, onSubmit, onCancel, isSubmitting }: StudentFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    isActive: true,
    role: 'STUDENT'
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        fullName: student.fullName,
        email: student.email,
        password: '', // Password not returned from API
        isActive: student.isActive,
        role: student.role
      });
    }
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only send password if it's a new student or if it's being changed
    const submissionData = { ...formData };
    if (!formData.password && student) {
      delete (submissionData as any).password;
    }
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Full Name</label>
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
            <UserIcon size={18} />
          </div>
          <input
            required
            type="text"
            className="w-full pl-12 pr-5 py-4 bg-surface border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-text-primary"
            placeholder="e.g. John Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Email Address</label>
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
            <Mail size={18} />
          </div>
          <input
            required
            type="email"
            className="w-full pl-12 pr-5 py-4 bg-surface border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-text-primary"
            placeholder="john.doe@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">
          {student ? 'New Password (Optional)' : 'Password'}
        </label>
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
            <Lock size={18} />
          </div>
          <input
            required={!student}
            type={showPassword ? 'text' : 'password'}
            className="w-full pl-12 pr-12 py-4 bg-surface border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-text-primary"
            placeholder={student ? "Leave blank to keep current" : "Enter secure password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Account Status</label>
        <select
          className="w-full px-5 py-4 bg-surface border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-text-primary"
          value={formData.isActive ? 'true' : 'false'}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-8 py-4 bg-white border border-border rounded-2xl font-bold text-text-secondary hover:bg-surface transition-all active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-8 py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary-hover hover:-translate-y-1 transition-all shadow-lg shadow-primary/20 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
        >
          {isSubmitting ? 'Saving...' : student ? 'Update Student' : 'Add Student'}
        </button>
      </div>
    </form>
  );
}
