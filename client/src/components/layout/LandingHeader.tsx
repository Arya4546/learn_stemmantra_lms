import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function LandingHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About & Corporate', path: '/about' },
    { name: 'Labs & Programs', path: '/programs' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <div className="w-full max-w-[90%] mx-auto pt-6 relative z-50">
      <header className="w-full bg-white/75 backdrop-blur-xl border border-slate-200/80 shadow-premium rounded-2xl px-6 py-4 flex items-center justify-between transition-all duration-300">
        {/* Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/">
            <img 
              src="/logo.png" 
              alt="STEMmantra Logo" 
              className="h-10 w-auto object-contain hover:scale-102 transition-transform cursor-pointer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-sans font-bold text-sm justify-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`transition-colors font-semibold text-sm ${
                  isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action & Mobile Menu Toggle */}
        <div className="flex-1 flex justify-end items-center gap-4">
          <button 
            onClick={() => navigate('/login')} 
            className="hidden sm:inline-block px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Login
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-primary transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu with Slide & Fade Animation */}
      {isOpen && (
        <div className="absolute top-24 left-0 right-0 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-premium rounded-2xl p-6 flex flex-col gap-4 md:hidden z-50 animate-float">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`font-semibold py-2 px-3 rounded-lg transition-all text-sm ${
                  isActive ? 'bg-primary/10 text-primary font-bold' : 'text-text-secondary hover:bg-slate-50 hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <button 
            onClick={() => {
              setIsOpen(false);
              navigate('/login');
            }} 
            className="w-full mt-2 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-all"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
}
