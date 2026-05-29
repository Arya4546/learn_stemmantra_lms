import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  LayoutDashboard, 
  Search, 
  Bell, 
  Menu,
  ArrowLeftRight
} from 'lucide-react';
import { useState } from 'react';
import { ProfileDropdown } from './ProfileDropdown';
import { useAuth } from '../../context/AuthContext';

export function StudentLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'My Curriculum', href: '/student/courses', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-text-primary">
      
      {/* Dark Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-brandDark text-slate-300 border-r border-slate-800/40 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/40 bg-brandDark/50 backdrop-blur-md">
          <Link to="/student" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="STEMmantra Logo" 
              className="h-10 w-auto object-contain hover:scale-102 transition-transform"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </Link>
        </div>

        {/* Student Menu */}
        <nav className="flex-1 p-5 space-y-1.5 mt-4">
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 mb-4 select-none flex items-center justify-between">
            <span>Student Portal</span>
            {user?.role === 'ADMIN' && (
              <span className="bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded text-[8px] font-black animate-pulse">
                DEMO MODE
              </span>
            )}
          </div>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/student');
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-xs font-black uppercase tracking-wider ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary border-l-4 border-primary shadow-glow-primary' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <item.icon size={16} className={`${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-white'} transition-colors`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Back to Admin Section */}
        {user?.role === 'ADMIN' && (
          <div className="p-5 border-t border-slate-800/50 bg-brandDark/30">
            <Link
              to="/admin/courses"
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary to-orange-600 hover:from-primary-hover hover:to-orange-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:translate-y-0.5 hover:-translate-y-0.5"
            >
              <ArrowLeftRight size={14} />
              Exit Demo View
            </Link>
          </div>
        )}

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white/70 backdrop-blur-lg border-b border-border flex items-center justify-between px-6 sm:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="lg:hidden p-2 text-text-secondary hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </button>
            
            <div className="hidden md:flex items-center gap-3 bg-slate-100/80 border border-slate-200/60 px-4 py-2.5 rounded-xl w-full max-w-md focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <Search size={16} className="text-text-secondary" />
              <input 
                type="text" 
                placeholder="Search your courses, modules, worksheets..." 
                className="bg-transparent border-none outline-none text-xs w-full font-bold text-text-primary placeholder:text-text-secondary/60"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button className="relative p-2.5 text-text-secondary hover:bg-slate-100 rounded-xl transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-white" />
            </button>
            
            <div className="h-6 w-px bg-border" />
            
            <ProfileDropdown />
          </div>
        </header>
        
        {/* Sub-page view portal */}
        <main className="flex-1 overflow-auto p-6 sm:p-8 relative scroll-smooth bg-slate-50 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
