import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { User as UserIcon, Key, Mail, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password validation checks
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        toast.error('Current password is required to change password.');
        return;
      }
      if (newPassword.length < 8) {
        toast.error('New password must be at least 8 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match.');
        return;
      }
    }

    const payload: any = {};
    if (fullName !== user?.fullName) {
      payload.fullName = fullName;
    }
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    if (Object.keys(payload).length === 0) {
      toast.error('No changes were made.');
      return;
    }

    const loadingToast = toast.loading('Saving profile settings...');
    setIsSubmitting(true);

    try {
      const response = await userService.updateProfile(payload);
      const updatedUser = response.data.data;
      
      // Update the client context to sync name change
      updateUser({ fullName: updatedUser.fullName });
      
      toast.success('Profile updated successfully!', { id: loadingToast });
      
      // Reset sensitive fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      onClose();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update profile settings.';
      toast.error(errMsg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile Settings">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Personal Details Header */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <UserIcon size={16} className="text-primary" />
          <h4 className="text-xs font-black uppercase tracking-widest text-text-primary">Personal Details</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1 flex items-center h-4">Full Name</label>
            <input
              required
              type="text"
              className="w-full h-12 px-5 bg-surface border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-text-primary text-sm"
              placeholder="Your Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1 flex items-center gap-1 h-4">
              Email Address <Mail size={10} className="opacity-50" />
            </label>
            <input
              disabled
              type="email"
              className="w-full h-12 px-5 bg-slate-50 border border-border rounded-2xl cursor-not-allowed font-medium text-text-secondary/70 text-sm"
              value={user?.email || ''}
            />
          </div>
        </div>

        {/* Change Password Header */}
        <div className="flex items-center gap-2 border-b border-border pb-2 pt-4">
          <Key size={16} className="text-primary" />
          <h4 className="text-xs font-black uppercase tracking-widest text-text-primary">Change Password</h4>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1 flex items-center h-4">Current Password</label>
            <input
              type="password"
              className="w-full h-12 px-5 bg-surface border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-text-primary text-sm"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <p className="text-[10px] text-text-secondary px-1 font-medium">Required only if changing password.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1 flex items-center h-4">New Password</label>
              <input
                type="password"
                className="w-full h-12 px-5 bg-surface border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-text-primary text-sm"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1 flex items-center h-4">Confirm New Password</label>
              <input
                type="password"
                className="w-full h-12 px-5 bg-surface border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-text-primary text-sm"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Security Warning */}
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex gap-3 items-start">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="font-medium">
            <p className="font-bold">Security Notice</p>
            <p className="mt-0.5 opacity-90 leading-relaxed">
              For security reasons, changing your password will terminate other active sessions. Make sure you remember your new password.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3.5 bg-white border border-border rounded-xl font-bold text-xs text-text-secondary hover:bg-surface transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-hover hover:-translate-y-0.5 transition-all shadow-md shadow-primary/10 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
