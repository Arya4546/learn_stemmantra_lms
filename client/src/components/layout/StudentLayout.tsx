import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  LogOut, 
  LayoutDashboard, 
  Search, 
  Bell, 
  ChevronDown,
  ShieldCheck,
  Menu,
  GraduationCap
} from 'lucide-react';
import { useState } from 'react';

export function StudentLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'My Courses', href: '/student/courses', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-surface flex font-sans text-text-primary">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-border bg-white">
          <div className="flex items-center gap-2">
            <ShieldCheck size={24} className="text-primary" />
            <span className="text-xl font-bold tracking-tight">Stem Mantra</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4">
          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] px-3 mb-4 opacity-50">
            Student Menu
          </div>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/student');
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-semibold ${
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5' 
                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                )}
                <item.icon size={20} className={`${isActive ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'} transition-colors`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
          >
            <div className="p-2 bg-surface group-hover:bg-red-100 rounded-lg transition-colors">
              <LogOut size={18} />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 shadow-sm shadow-black/5">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="lg:hidden p-2 text-text-secondary hover:bg-surface rounded-lg"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </button>
            
            <div className="hidden md:flex items-center gap-3 bg-surface border border-border px-4 py-2 rounded-xl w-full max-w-md focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <Search size={18} className="text-text-secondary" />
              <input 
                type="text" 
                placeholder="Search your courses, lessons, notes..." 
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2 text-text-secondary hover:bg-surface rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            
            <div className="h-8 w-px bg-border mx-2" />
            
            <button className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-surface rounded-full transition-all group">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-md shadow-primary/20">
                {user?.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-text-primary leading-tight">{user?.fullName}</p>
                <div className="flex items-center gap-1">
                  <GraduationCap size={10} className="text-primary" />
                  <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Student</p>
                </div>
              </div>
              <ChevronDown size={14} className="text-text-secondary group-hover:text-text-primary transition-colors" />
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 sm:p-8 relative scroll-smooth bg-surface">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
