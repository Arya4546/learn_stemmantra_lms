import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-[#030712] border-t border-slate-950 text-slate-400 py-16 font-sans">
      <div className="max-w-[90%] mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-slate-900">
          
          {/* Logo & Description */}
          <div className="md:col-span-5 flex flex-col gap-4 text-left">
            <img 
              src="/logo.png" 
              alt="STEMmantra Logo" 
              className="h-10 w-auto object-contain self-start"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <p className="text-sm leading-relaxed max-w-sm font-light text-slate-400">
              India's leading provider of turn-key Robotics, Artificial Intelligence, Coding, and STEM Laboratory ecosystems for K-12 educational institutions.
            </p>
          </div>

          {/* Quick Links */}
          <nav className="md:col-span-3 text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  LMS Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  About & Corporate
                </Link>
              </li>
              <li>
                <Link to="/programs" className="hover:text-primary transition-colors">
                  Labs & Programs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a 
                  href="https://stemmantra.com/career" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  Career Opportunities <ExternalLink size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </nav>

          {/* Noida Coordinates */}
          <div className="md:col-span-4 text-left space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Noida Headquarters</h4>
            
            <div className="flex items-start gap-3 text-sm">
              <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
              <span>
                C-104, 2nd Floor, Sector-10, Noida, <br />
                Uttar Pradesh – 201301
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Mail size={18} className="text-primary shrink-0" />
              <a href="mailto:sales@stemmantra.com" className="hover:text-primary transition-colors">
                sales@stemmantra.com
              </a>
            </div>

            <div className="flex flex-col gap-1 text-sm pl-7">
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-slate-500" />
                <span>Helpline: +91-6356631515</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-slate-500" />
                <span>Landline: 0120-3101774</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom footer bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} STEMmantra. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://stemmantra.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="https://stemmantra.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="https://stemmantra.com/refund-policy" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Refund Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
