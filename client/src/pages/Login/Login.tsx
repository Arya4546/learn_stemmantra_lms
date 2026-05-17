import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken } = response.data.data;
      
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      
      login(accessToken, refreshToken, {
        id: payload.userId,
        role: payload.role,
        email: email,
        fullName: email.split('@')[0]
      });

      if (payload.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-text-primary">
      {/* Left Side: Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden">
        <img 
          src="/login-bg.png" 
          alt="Premium Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />
        
        <div className="relative z-10 p-16 max-w-xl text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight">Stem Mantra</span>
          </div>
          <h2 className="text-5xl font-extrabold mb-6 leading-tight">
            Secure Learning, <br />
            <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Reimagined.</span>
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed font-light">
            Access our elite educational content with military-grade security and a seamless learning experience tailored for excellence.
          </p>
          
          <div className="mt-12 flex gap-8">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">100%</span>
              <span className="text-sm text-gray-400 uppercase tracking-widest">Protected</span>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">Elite</span>
              <span className="text-sm text-gray-400 uppercase tracking-widest">Content</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-20 bg-surface">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <ShieldCheck size={28} className="text-primary" />
            <span className="text-2xl font-bold text-text-primary tracking-tight">Stem Mantra</span>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-bold text-text-primary mb-3">Welcome Back</h1>
            <p className="text-text-secondary text-lg">Enter your credentials to access your portal</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-xl mb-8 flex items-center gap-3 animate-shake">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-text-primary tracking-wide uppercase">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-xl text-text-primary transition-all duration-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium shadow-sm hover:border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-bold text-text-primary tracking-wide uppercase">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={20} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-white border border-border rounded-xl text-text-primary transition-all duration-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium shadow-sm hover:border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary text-white border-none rounded-xl py-4 text-lg font-bold cursor-pointer transition-all duration-300 shadow-xl shadow-primary/20 hover:bg-primary-hover hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-8 group"
            >
              {isLoading ? (
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="flex items-center gap-2">
                  Access Portal
                  <ShieldCheck size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-text-secondary text-sm">
              &copy; {new Date().getFullYear()} Stem Mantra. All rights reserved. <br />
              <span className="opacity-60 text-xs mt-2 inline-block">Highly Secure Educational Environment</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
