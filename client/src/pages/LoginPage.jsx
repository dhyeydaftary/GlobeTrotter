import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Globe, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { post } from '../api/client';
import { HERO_PARIS, TRIP_CARD_FALLBACK } from '../constants/images';
import { springSettle } from '../lib/motion';
import FormField from '../components/FormField';
import { validateEmail, validateRequired } from '../utils/validation';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const reduceMotion = useReducedMotion();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const emailError = validateEmail(email);
  const passwordError = validateRequired(password, 'Password');

  const handleQuickDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await post('/auth/login', { email: 'demo@globetrotter.app', password: 'demo1234' });
      login(data.token, data.user, rememberMe);
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
    setTouched({ email: true, password: true });

    if (emailError || passwordError) {
      return;
    }

    setLoading(true);

    try {
      const data = await post('/auth/login', { email, password });
      login(data.token, data.user, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const tapProps = reduceMotion ? {} : { whileTap: { scale: 0.97 }, transition: springSettle };

  return (
    <div className="page-enter min-h-screen bg-surface flex flex-col md:flex-row pt-16">
      {/* Left Column (Desktop Hero Brand Showcase) */}
      <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-[#1A1A2E] via-[#2D2A5C] to-[#14141F] text-white p-12 lg:p-16 flex-col justify-between overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-accent-light">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>AI-Powered Travel Experience</span>
          </div>
        </div>

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
            <h2 className="text-display-md text-2xl lg:text-3xl font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>
              Plan your next trip in minutes.
            </h2>
            <p className="text-text-light text-sm leading-relaxed">
              Build multi-city itineraries, manage daily activities, track live budgets, and share your adventures effortlessly.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-white/50 border-t border-white/10 pt-4">
          <span>GlobeTrotter Travel Planner</span>
          <span>© 2026</span>
        </div>
      </div>

      {/* Right Column (Form Container) */}
      <div className="w-full md:w-1/2 relative flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-surface overflow-hidden">
        <div className="absolute top-1/4 -right-16 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springSettle}
          className="relative z-10 w-full max-w-md gt-glass-panel rounded-card p-8 sm:p-10"
        >
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent text-white shadow-btn-accent mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h1 className="text-display-md text-2xl font-bold text-text-main" style={{ letterSpacing: '-0.02em' }}>
              Welcome back
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Log in to access your planned adventures
            </p>
          </div>

          <div className="mb-6 bg-accent-light/70 border border-accent/20 rounded-xl p-3.5 text-center space-y-2">
            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-accent-dark">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Hackathon Demo Mode</span>
            </div>
            <motion.button
              type="button"
              onClick={handleQuickDemoLogin}
              {...tapProps}
              className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-white border border-accent/30 hover:border-accent hover:bg-accent-light text-accent-dark font-semibold text-xs rounded-btn transition-colors shadow-sm"
            >
              <span>Instant Demo Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 text-accent" />
            </motion.button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs sm:text-sm flex items-start gap-2">
              <span className="font-bold">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              error={touched.email ? emailError : null}
              autoComplete="email"
            />

            <FormField
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              error={touched.password ? passwordError : null}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center gap-2 text-text-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border-light text-accent focus:ring-accent/30 cursor-pointer"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-accent font-semibold hover:text-accent-dark transition-colors">
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              {...tapProps}
              className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-btn shadow-btn-accent transition-colors duration-150 mt-3 text-sm disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Log In'}
            </motion.button>
          </form>

          <p className="text-center text-xs sm:text-sm text-text-muted mt-6">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-accent font-bold hover:text-accent-dark transition-colors"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
