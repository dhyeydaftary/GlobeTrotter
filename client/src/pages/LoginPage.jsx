import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { post } from '../api/client';
import { MOCK_USER } from '../api/mocks';
import ErrorBanner from '../components/ErrorBanner';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickDemoLogin = () => {
    const fakeToken = 'mock_jwt_token_' + Date.now();
    login(fakeToken, MOCK_USER);
    navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError({ message: 'Email is required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError({ message: 'Please enter a valid email address.' });
      return;
    }

    if (!password) {
      setError({ message: 'Password is required.' });
      return;
    }

    if (password.length < 6) {
      setError({ message: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      // Fallback for hackathon demo mode if backend is offline
      if (err.code === 'NETWORK_ERROR' || err.code === 'HTTP_ERROR' || err.code === 'UNKNOWN_ERROR') {
        const fakeToken = 'mock_jwt_token_' + Date.now();
        login(fakeToken, { ...MOCK_USER, email });
        navigate('/dashboard');
      } else {
        setError({
          message: err.message || 'Invalid email or password.',
          code: err.code,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface py-12 px-4">
      {/* Card Container: max-w-420px, p-10 (40px), rounded-20px, box-shadow: 0 4px 24px rgba(0,0,0,0.08) */}
      <div className="w-full max-w-[420px] bg-white p-10 rounded-[20px] shadow-[0_4_24px_rgba(0,0,0,0.08)] border border-borderLight space-y-6">
        {/* Logo & Title Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-accent-glow">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-black text-2xl tracking-tight text-primary">
              Globe<span className="text-accent font-black">Trotter</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-textMain tracking-tight font-display">
            Welcome back
          </h1>
          <p className="mt-1 text-xs text-textMuted leading-relaxed">
            Log in to manage your multi-city itineraries & travel budgets
          </p>
        </div>

        {/* Demo Mode Quick Button */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-[11px] text-amber-900 font-bold mb-1.5">
            🚀 Hackathon Demo Mode
          </p>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-btn shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Sign In</span>
          </button>
        </div>

        {/* Red Error Banner above submit button */}
        {error && (
          <ErrorBanner
            message={error.message}
            code={error.code}
            onClose={() => setError(null)}
          />
        )}

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3.5 py-2.5 border border-borderLight rounded-input text-sm bg-slate-50/50"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="mb-0">Password</label>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset link is stubbed for this demo.');
                }}
                className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3.5 py-2.5 border border-borderLight rounded-input text-sm bg-slate-50/50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 text-sm font-bold rounded-btn text-white bg-primary hover:bg-primary-light transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                'Logging in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-4 border-t border-borderLight">
          <p className="text-xs text-textMuted">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-accent hover:text-accent-hover transition-colors">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
