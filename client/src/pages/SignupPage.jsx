import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Globe, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { post } from '../api/client';
import { HERO_BALI, TRIP_CARD_FALLBACK } from '../constants/images';
import { springSettle } from '../lib/motion';
import FormField from '../components/FormField';
import {
  validateEmail, validateRequired, validatePassword, validateConfirmPassword,
} from '../utils/validation';

const FIELDS = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];

const validateField = (field, values) => {
  switch (field) {
    case 'firstName': return validateRequired(values.firstName, 'First name');
    case 'lastName': return validateRequired(values.lastName, 'Last name');
    case 'email': return validateEmail(values.email);
    case 'password': return validatePassword(values.password);
    case 'confirmPassword': return validateConfirmPassword(values.password, values.confirmPassword);
    default: return null;
  }
};

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const reduceMotion = useReducedMotion();

  const [values, setValues] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  const errors = Object.fromEntries(FIELDS.map((f) => [f, validateField(f, values)]));
  const showError = (field) => (touched[field] ? errors[field] : null);

  const handleChange = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
  };
  const handleBlur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handleQuickDemoSignup = async () => {
    setSubmitError(null);
    setLoading(true);
    try {
      const data = await post('/auth/login', { email: 'demo@globetrotter.app', password: 'demo1234' });
      login(data.token, data.user, true);
      navigate('/dashboard');
    } catch (err) {
      setSubmitError(err.message || 'Failed to sign in to the demo account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setTouched(Object.fromEntries(FIELDS.map((f) => [f, true])));

    if (FIELDS.some((f) => validateField(f, values))) {
      return;
    }

    setLoading(true);
    try {
      const data = await post('/auth/signup', {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      login(data.token, data.user, true);
      navigate('/dashboard');
    } catch (err) {
      setSubmitError(err.message || 'Failed to create account.');
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
              src={HERO_BALI}
              alt="Travel destination"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = TRIP_CARD_FALLBACK;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-light bg-accent/80 px-2.5 py-0.5 rounded-full">
                Effortless Planning
              </span>
              <p className="text-white font-display font-bold text-base mt-1">
                Your journey starts here
              </p>
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-display-md text-2xl lg:text-3xl font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>
              Create your account in seconds.
            </h2>
            <p className="text-text-light text-sm leading-relaxed">
              Join travelers building multi-city itineraries, discovering local activities, and tracking travel budgets effortlessly.
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
        {/* Decorative blurred backdrop so the frosted-glass card has something to blur */}
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
              Get Started Free
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Start planning your next adventure
            </p>
          </div>

          <div className="mb-6 bg-accent-light/70 border border-accent/20 rounded-xl p-3.5 text-center space-y-2">
            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-accent-dark">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Hackathon Demo Mode</span>
            </div>
            <motion.button
              type="button"
              onClick={handleQuickDemoSignup}
              {...tapProps}
              className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-white border border-accent/30 hover:border-accent hover:bg-accent-light text-accent-dark font-semibold text-xs rounded-btn transition-colors shadow-sm"
            >
              <span>Instant Demo Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 text-accent" />
            </motion.button>
          </div>

          {submitError && (
            <div className="mb-5 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs sm:text-sm flex items-start gap-2">
              <span className="font-bold">⚠</span>
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="First Name"
                placeholder="Alex"
                value={values.firstName}
                onChange={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
                error={showError('firstName')}
                autoComplete="given-name"
              />
              <FormField
                label="Last Name"
                placeholder="Rivera"
                value={values.lastName}
                onChange={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                error={showError('lastName')}
                autoComplete="family-name"
              />
            </div>

            <FormField
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              error={showError('email')}
              autoComplete="email"
            />

            <FormField
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={values.password}
              onChange={handleChange('password')}
              onBlur={handleBlur('password')}
              error={showError('password')}
              autoComplete="new-password"
            />

            <FormField
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={values.confirmPassword}
              onChange={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              error={showError('confirmPassword')}
              autoComplete="new-password"
            />

            <motion.button
              type="submit"
              disabled={loading}
              {...tapProps}
              className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-btn shadow-btn-accent transition-colors duration-150 mt-3 text-sm disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-xs sm:text-sm text-text-muted mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent font-bold hover:text-accent-dark transition-colors"
            >
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
