import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Settings, ChevronDown, Sparkles, GraduationCap } from 'lucide-react';
import { ProfileSettingsModal } from './ProfileSettingsModal';

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 pl-2 py-1 group select-none hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl transition-all outline-none"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black text-sm shadow-md shadow-primary/20">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-black text-text-primary leading-tight group-hover:text-primary transition-colors">
            {user.fullName}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            {isAdmin ? (
              <>
                <Sparkles size={10} className="text-primary animate-pulse" />
                <p className="text-[9px] font-black text-primary uppercase tracking-widest">Administrator</p>
              </>
            ) : (
              <>
                <GraduationCap size={10} className="text-primary" />
                <p className="text-[9px] font-black text-primary uppercase tracking-widest">Student</p>
              </>
            )}
          </div>
        </div>
        <ChevronDown size={14} className={`text-text-secondary transition-transform duration-250 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl border border-border shadow-premium overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* User Header Details */}
          <div className="p-5 bg-surface/50 border-b border-border flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/10">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-text-primary truncate leading-tight">{user.fullName}</p>
              <p className="text-[10px] font-bold text-text-secondary truncate mt-0.5">{user.email}</p>
              
              <span className={`inline-block mt-2 px-2 py-0.5 border rounded-md text-[8px] font-black uppercase tracking-wider ${
                isAdmin ? 'bg-primary/5 border-primary/15 text-primary' : 'bg-indigo-50 border-indigo-100 text-indigo-700'
              }`}>
                {isAdmin ? 'Admin' : 'Student'}
              </span>
            </div>
          </div>

          {/* Actions List */}
          <div className="p-2 space-y-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsSettingsOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-text-secondary hover:text-primary hover:bg-primary/5 rounded-2xl transition-all text-left"
            >
              <Settings size={16} />
              Profile Settings
            </button>
            
            <div className="h-px bg-border my-1" />

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-50 rounded-2xl transition-all text-left group"
            >
              <LogOut size={16} className="text-red-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal component trigger */}
      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
