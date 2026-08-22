import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Globe, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { post } from '../api/client';
import { HERO_PARIS, TRIP_CARD_FALLBACK } from '../constants/images';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleQuickDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await post('/auth/login', { email: 'demo@globetrotter.app', password: 'demo1234' });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in to the demo account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);

    try {
      const data = await post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter min-h-screen bg-surface flex flex-col md:flex-row pt-16">
      {/* Left Column (Desktop Hero Brand Showcase) */}
      <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-[#1A1A2E] via-[#2D2A5C] to-[#14141F] text-white p-12 lg:p-16 flex-col justify-between overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top brand moment */}
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-accent-light">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>AI-Powered Travel Experience</span>
          </div>
        </div>

        {/* Centerpiece Photography & Reassurance */}
        <div className="relative z-10 my-8 space-y-6">
          <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl max-w-md aspect-[4/3]">
            <img
              src={HERO_PARIS}
              alt="Travel destination"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = TRIP_CARD_FALLBACK;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-light bg-accent/80 px-2.5 py-0.5 rounded-full">
                Curated Itinerary
              </span>
              <p className="text-white font-display font-bold text-base mt-1">
                Explore the world on your schedule
              </p>
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-display-md text-2xl lg:text-3xl font-extrabold text-white">
              Plan your next trip in minutes.
            </h2>
            <p className="text-text-light text-sm leading-relaxed">
              Build multi-city itineraries, manage daily activities, track live budgets, and share your adventures effortlessly.
            </p>
          </div>
        </div>

        {/* Bottom footer credit */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/50 border-t border-white/10 pt-4">
          <span>GlobeTrotter Travel Planner</span>
          <span>© 2026</span>
        </div>
      </div>

      {/* Right Column (Form Container) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-surface">
        <div className="w-full max-w-md bg-surface-card rounded-card border border-border-light shadow-card p-8 sm:p-10">
          {/* Logo & Headline */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent text-white shadow-btn-accent mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h1 className="text-display-md text-2xl font-bold text-text-main">
              Welcome back
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Log in to access your planned adventures
            </p>
          </div>

          {/* Restyled Hackathon Demo Banner */}
          <div className="mb-6 bg-accent-light/70 border border-accent/20 rounded-xl p-3.5 text-center space-y-2">
            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-accent-dark">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Hackathon Demo Mode</span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-white border border-accent/30 hover:border-accent hover:bg-accent-light text-accent-dark font-semibold text-xs rounded-btn transition-colors shadow-sm active:scale-[0.97]"
            >
              <span>Instant Demo Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 text-accent" />
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs sm:text-sm flex items-start gap-2">
              <span className="font-bold">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-btn border border-border-light bg-surface text-text-main placeholder:text-text-light text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-btn border border-border-light bg-surface text-text-main placeholder:text-text-light text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-btn shadow-btn-accent active:scale-[0.97] transition-all duration-150 mt-3 text-sm disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          {/* Switch Link */}
          <p className="text-center text-xs sm:text-sm text-text-muted mt-6">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-accent font-bold hover:text-accent-dark transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
