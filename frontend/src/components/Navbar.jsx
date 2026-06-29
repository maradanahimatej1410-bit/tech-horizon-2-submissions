import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Laptop, Award, ShieldCheck, ClipboardCheck, FileText, ClipboardList, HelpCircle } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith('/admin')) {
      localStorage.removeItem('admin_token');
    }
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Laptop },
    { name: 'Status Check', path: '/status', icon: ShieldCheck },
    { name: 'Team Registration', path: '/register', icon: ClipboardCheck },
    { name: 'ID Verification', path: '/verify', icon: Award },
    { name: 'Project Idea Submission', path: '/submit-idea', icon: FileText },
    { name: 'Project Idea Status', path: '/project-idea-status', icon: ClipboardList },
    { name: 'Contact Support', path: '/support', icon: HelpCircle }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-nav sticky top-0 z-50 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white font-bold tracking-wider text-xs">
            IEEE
          </div>
          <div>
            <span className="font-extrabold text-white text-base md:text-lg tracking-tight">TECH HORIZON</span>
            <span className="text-blue-500 font-bold text-xs ml-1 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">2.0</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  active 
                    ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          <Link
            to="/admin/dashboard"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 shadow-md shadow-blue-500/10"
          >
            Organizer Room
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-300 hover:text-white focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden mt-3 p-4 rounded-xl glass flex flex-col space-y-3 animate-fadeIn">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 p-3 rounded-lg text-sm font-medium transition-all ${
                  active 
                    ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <Link
            to="/admin/dashboard"
            onClick={() => setIsOpen(false)}
            className="w-full text-center bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg text-sm font-semibold transition-all shadow-md"
          >
            Organizer Room
          </Link>
        </div>
      )}
    </nav>
  );
}
