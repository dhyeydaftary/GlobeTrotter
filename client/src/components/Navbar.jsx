import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe, LogOut, PlusCircle, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#1E3A5F]/92 backdrop-blur-md shadow-md border-b border-white/10 py-1'
          : 'bg-primary border-b border-white/10 py-2'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2.5 font-black text-xl tracking-tight text-white group">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-accent-glow transition-transform group-hover:scale-105">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="font-display">
              Globe<span className="text-accent font-black">Trotter</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/dashboard"
                className={`text-sm font-semibold transition-colors relative py-1.5 ${
                  isActive('/dashboard') || isActive('/') ? 'text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Dashboard</span>
                {(isActive('/dashboard') || isActive('/')) && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-[3px] bg-accent rounded-full animate-fade-in" />
                )}
              </Link>

              <Link
                to="/trips"
                className={`text-sm font-semibold transition-colors relative py-1.5 ${
                  isActive('/trips') ? 'text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>My Trips</span>
                {isActive('/trips') && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-[3px] bg-accent rounded-full animate-fade-in" />
                )}
              </Link>

              {/* Plan Trip CTA Button */}
              <Link
                to="/trips/new"
                className="inline-flex items-center space-x-1.5 text-xs font-extrabold bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-btn shadow-accent-glow hover:scale-[1.02] active:scale-[0.97] transition-all duration-160"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Plan Trip</span>
              </Link>

              <div className="h-5 w-px bg-white/20" />

              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2.5 group focus:outline-none"
                  title="View Profile"
                >
                  {/* User Avatar Circle Fallback: 36px coral circle with white initial */}
                  {user?.photoUrl && !imageError ? (
                    <img
                      src={user.photoUrl}
                      alt={user.name}
                      onError={() => setImageError(true)}
                      className="w-9 h-9 rounded-full object-cover border-2 border-accent group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-accent text-white font-semibold text-sm flex items-center justify-center border-2 border-white/20 group-hover:scale-105 transition-transform shadow-sm">
                      {userInitial}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-100 group-hover:text-accent transition-colors">
                    {user?.name || 'Explorer'}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-accent p-1.5 rounded-lg transition-colors focus:outline-none"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}

          {/* Mobile Menu Toggle */}
          {isAuthenticated && (
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-200 hover:text-white p-2 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden bg-primary-dark border-t border-white/10 px-4 pt-3 pb-5 space-y-3 animate-fade-in">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 hover:text-white py-2"
          >
            Dashboard
          </Link>
          <Link
            to="/trips"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 hover:text-white py-2"
          >
            My Trips
          </Link>
          <Link
            to="/trips/new"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-accent hover:text-accent-hover py-2"
          >
            + Plan New Trip
          </Link>
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 hover:text-white py-2"
          >
            Profile ({user?.name})
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full text-left text-sm font-semibold text-rose-400 hover:text-rose-300 py-2 flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
