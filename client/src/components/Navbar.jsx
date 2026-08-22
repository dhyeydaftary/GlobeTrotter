import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, PlusCircle, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Airplane SVG icon — replaces the Compass/Globe
const AirplaneIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

const Navbar = ({ variant }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMarketing =
    variant === 'marketing' ||
    location.pathname === '/' ||
    location.pathname === '/landing';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const scrollToId = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const brandTo = isAuthenticated ? '/dashboard' : '/';
  const isDarkHeroOverlay = isMarketing && !scrolled && !mobileMenuOpen;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300 ${
        isDarkHeroOverlay ? 'gt-glass-dark shadow-sm' : 'gt-glass shadow-sm'
      }`}
    >
      {/* 3-column grid: brand | center nav | right actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-3 items-center">

        {/* ── Left: Brand ── */}
        <Link
          to={brandTo}
          className="flex items-center space-x-2.5 font-black text-xl tracking-tight group"
        >
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-btn-accent transition-transform duration-200 group-hover:scale-105">
            <AirplaneIcon className="w-5 h-5 text-white" />
          </div>
          <span
            className={`font-display text-lg font-bold tracking-tight transition-colors ${
              isDarkHeroOverlay ? 'text-white' : 'text-text-main'
            }`}
          >
            Globe<span className="text-accent font-extrabold">Trotter</span>
          </span>
        </Link>

        {/* ── Center: Nav Links ── */}
        {isAuthenticated ? (
          /* Authenticated center links */
          <div className="hidden md:flex items-center justify-center space-x-7">
            <Link
              to="/dashboard"
              className={`text-sm font-semibold transition-colors relative py-1.5 ${
                isActive('/dashboard')
                  ? isDarkHeroOverlay
                    ? 'text-white font-bold'
                    : 'text-text-main font-bold'
                  : isDarkHeroOverlay
                  ? 'text-white/75 hover:text-white'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Dashboard
              {isActive('/dashboard') && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-accent rounded-full" />
              )}
            </Link>

            <Link
              to="/trips"
              className={`text-sm font-semibold transition-colors relative py-1.5 ${
                isActive('/trips')
                  ? isDarkHeroOverlay
                    ? 'text-white font-bold'
                    : 'text-text-main font-bold'
                  : isDarkHeroOverlay
                  ? 'text-white/75 hover:text-white'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              My Trips
              {isActive('/trips') && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-accent rounded-full" />
              )}
            </Link>
          </div>
        ) : (
          /* Unauthenticated center links (marketing page only) */
          <div className="hidden md:flex items-center justify-center space-x-6">
            {isMarketing && (
              <>
                <button
                  type="button"
                  onClick={() => scrollToId('features')}
                  className={`text-sm font-medium transition-colors ${
                    isDarkHeroOverlay
                      ? 'text-white/80 hover:text-white'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Features
                </button>
                <button
                  type="button"
                  onClick={() => scrollToId('how-it-works')}
                  className={`text-sm font-medium transition-colors ${
                    isDarkHeroOverlay
                      ? 'text-white/80 hover:text-white'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  How it works
                </button>
                <button
                  type="button"
                  onClick={() => scrollToId('testimonials')}
                  className={`text-sm font-medium transition-colors ${
                    isDarkHeroOverlay
                      ? 'text-white/80 hover:text-white'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Reviews
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Right: Actions ── */}
        {isAuthenticated ? (
          <div className="hidden md:flex items-center justify-end space-x-3">
            <Link
              to="/trips/new"
              className="flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-btn font-semibold text-sm hover:bg-accent-hover hover:shadow-btn-accent active:scale-[0.97] transition-all duration-150"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Plan Trip</span>
            </Link>

            <div className={`h-4 w-px ${isDarkHeroOverlay ? 'bg-white/20' : 'bg-border-light'}`} />

            <Link
              to="/profile"
              className="flex items-center space-x-2 group focus:outline-none"
              aria-label="View profile"
              title="View Profile"
            >
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-accent/30"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-8 h-8 rounded-full bg-accent-light text-accent border border-accent/20 flex items-center justify-center font-bold text-xs ${
                  user?.photoUrl ? 'hidden' : 'flex'
                }`}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className={`transition-colors p-1.5 rounded-lg ${
                isDarkHeroOverlay
                  ? 'text-white/60 hover:text-white hover:bg-white/10'
                  : 'text-text-muted hover:text-text-main hover:bg-surface-raised'
              }`}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className={`text-sm font-semibold rounded-btn px-4 py-2 transition-all duration-150 ${
                isDarkHeroOverlay
                  ? 'text-white border border-white/30 hover:bg-white/10'
                  : 'text-text-main border border-border-strong hover:bg-surface-raised'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-sm font-bold bg-accent hover:bg-accent-hover text-white rounded-btn px-4 py-2 shadow-btn-accent active:scale-[0.97] transition-all duration-150"
            >
              Get Started
            </button>
          </div>
        )}

        {/* ── Mobile Toggle ── */}
        <div className="md:hidden flex justify-end col-span-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkHeroOverlay
                ? 'text-white/90 hover:text-white'
                : 'text-text-main hover:bg-surface-raised'
            }`}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden absolute top-16 left-0 right-0 px-5 pt-3 pb-6 space-y-3 shadow-xl ${
            isMarketing && !scrolled
              ? 'gt-glass-dark border-t border-white/10 text-white'
              : 'gt-glass border-t border-border-light text-text-main'
          }`}
        >
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold py-2 transition-colors hover:text-accent"
              >
                Dashboard
              </Link>
              <Link
                to="/trips"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold py-2 transition-colors hover:text-accent"
              >
                My Trips
              </Link>
              <Link
                to="/trips/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold text-accent py-2"
              >
                + Plan New Trip
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold py-2 transition-colors hover:text-accent"
              >
                Profile ({user?.name || 'User'})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left text-sm font-semibold text-danger py-2 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              {isMarketing && (
                <>
                  <button
                    type="button"
                    onClick={() => scrollToId('features')}
                    className="block w-full text-left text-sm font-semibold py-2"
                  >
                    Features
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToId('how-it-works')}
                    className="block w-full text-left text-sm font-semibold py-2"
                  >
                    How it works
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToId('testimonials')}
                    className="block w-full text-left text-sm font-semibold py-2"
                  >
                    Reviews
                  </button>
                </>
              )}
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold py-2 hover:text-accent"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold text-accent py-2"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
