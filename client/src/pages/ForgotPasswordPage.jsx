import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { post } from '../api/client';
import { springSettle } from '../lib/motion';
import FormField from '../components/FormField';
import {
  validateEmail, validatePassword, validateConfirmPassword, validateOtp,
} from '../utils/validation';

const STEP_EMAIL = 'email';
const STEP_RESET = 'reset';
const STEP_DONE = 'done';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [step, setStep] = useState(STEP_EMAIL);
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetTouched, setResetTouched] = useState({});
  const [resetError, setResetError] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);

  const emailFormatError = validateEmail(email);
  const otpError = validateOtp(otp);
  const passwordError = validatePassword(newPassword);
  const confirmError = validateConfirmPassword(newPassword, confirmPassword);

  useEffect(() => {
    if (step === STEP_DONE) {
      const t = setTimeout(() => navigate('/login', { replace: true }), 2200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [step, navigate]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setEmailTouched(true);
    setEmailError(null);
    if (emailFormatError) return;

    setEmailLoading(true);
    try {
      await post('/auth/forgot-password', { email: email.trim() });
      // Backend intentionally returns the same generic success regardless of
      // whether the account exists — advance to step 2 either way.
      setStep(STEP_RESET);
    } catch (err) {
      // A real transport/server failure, not "account doesn't exist" (backend never says that).
      setEmailError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleResend = async () => {
    setResendStatus(null);
    try {
      await post('/auth/forgot-password', { email: email.trim() });
      setResendStatus('sent');
    } catch (err) {
      setResendStatus('error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetTouched({ otp: true, newPassword: true, confirmPassword: true });
    setResetError(null);
    if (otpError || passwordError || confirmError) return;

    setResetLoading(true);
    try {
      await post('/auth/reset-password', { email: email.trim(), otp: otp.trim(), newPassword });
      setStep(STEP_DONE);
    } catch (err) {
      setResetError({ code: err.code, message: err.message || 'Failed to reset password.' });
    } finally {
      setResetLoading(false);
    }
  };

  const tapProps = reduceMotion ? {} : { whileTap: { scale: 0.97 }, transition: springSettle };
  const stepMotionProps = reduceMotion
    ? {
        initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: springSettle,
      };

  return (
    <div className="page-enter min-h-screen bg-surface flex items-center justify-center pt-16 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-24 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-24 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSettle}
        className="relative z-10 w-full max-w-md gt-glass-panel rounded-card p-8 sm:p-10 overflow-hidden"
      >
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent text-white shadow-btn-accent mb-4">
            <Globe className="w-6 h-6" />
          </div>
          <h1 className="text-display-md text-2xl font-bold text-text-main" style={{ letterSpacing: '-0.02em' }}>
            {step === STEP_EMAIL && 'Reset your password'}
            {step === STEP_RESET && 'Check your email'}
            {step === STEP_DONE && 'All set!'}
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {step === STEP_EMAIL && "Enter your email and we'll send you a code."}
            {step === STEP_RESET && `We sent a 6-digit code to ${email || 'your email'} if an account exists for it.`}
            {step === STEP_DONE && 'Your password has been reset.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === STEP_EMAIL && (
            <motion.form key="email-step" {...stepMotionProps} onSubmit={handleRequestOtp} className="space-y-4" noValidate>
              {emailError && (
                <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs sm:text-sm flex items-start gap-2">
                  <span className="font-bold">⚠</span>
                  <span>{emailError}</span>
                </div>
              )}
              <FormField
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                error={emailTouched ? emailFormatError : null}
                autoComplete="email"
              />
              <motion.button
                type="submit"
                disabled={emailLoading}
                {...tapProps}
                className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-btn shadow-btn-accent transition-colors duration-150 mt-3 text-sm disabled:opacity-50"
              >
                {emailLoading ? 'Sending...' : 'Send Code'}
              </motion.button>
            </motion.form>
          )}

          {step === STEP_RESET && (
            <motion.form key="reset-step" {...stepMotionProps} onSubmit={handleResetPassword} className="space-y-4" noValidate>
              {resetError && (
                <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs sm:text-sm flex items-start gap-2">
                  <span className="font-bold">⚠</span>
                  <span>{resetError.message}</span>
                </div>
              )}
              <FormField
                label="6-digit code"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onBlur={() => setResetTouched((t) => ({ ...t, otp: true }))}
                error={resetTouched.otp ? otpError : null}
                autoComplete="one-time-code"
              />
              <FormField
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onBlur={() => setResetTouched((t) => ({ ...t, newPassword: true }))}
                error={resetTouched.newPassword ? passwordError : null}
                autoComplete="new-password"
              />
              <FormField
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setResetTouched((t) => ({ ...t, confirmPassword: true }))}
                error={resetTouched.confirmPassword ? confirmError : null}
                autoComplete="new-password"
              />

              <motion.button
                type="submit"
                disabled={resetLoading}
                {...tapProps}
                className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-btn shadow-btn-accent transition-colors duration-150 mt-3 text-sm disabled:opacity-50"
              >
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </motion.button>

              <p className="text-center text-xs text-text-muted">
                Didn't get a code?{' '}
                <button type="button" onClick={handleResend} className="text-accent font-bold hover:text-accent-dark transition-colors">
                  Resend it
                </button>
                {resendStatus === 'sent' && <span className="text-success ml-1">Sent!</span>}
                {resendStatus === 'error' && <span className="text-danger ml-1">Failed — try again.</span>}
              </p>
            </motion.form>
          )}

          {step === STEP_DONE && (
            <motion.div key="done-step" {...stepMotionProps} className="text-center py-4 space-y-3">
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={springSettle}
                className="w-14 h-14 mx-auto rounded-full bg-success/10 flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-success" />
              </motion.div>
              <p className="text-text-muted text-sm">Redirecting you to login...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== STEP_DONE && (
          <p className="text-center text-xs sm:text-sm text-text-muted mt-6">
            <Link to="/login" className="text-accent font-bold hover:text-accent-dark transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to login
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
