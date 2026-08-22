import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { springSettle } from '../lib/motion';

// Shared text-input field with inline (as-you-type / on-blur) validation,
// spring-animated error appearance per the house motion system.
const FormField = ({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  autoComplete,
  rightElement,
}) => {
  const reduceMotion = useReducedMotion();
  const errorMotionProps = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -4 }, transition: springSettle };

  return (
    <div>
      <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          className={`w-full px-4 py-3 rounded-btn border bg-surface text-text-main placeholder:text-text-light text-sm focus:outline-none focus:ring-2 transition-colors duration-150 ${
            error
              ? 'border-danger focus:border-danger focus:ring-danger/20'
              : 'border-border-light focus:border-accent focus:ring-accent/20'
          } ${rightElement ? 'pr-10' : ''}`}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            {...errorMotionProps}
            className="text-danger text-xs mt-1.5 flex items-center gap-1 font-medium"
          >
            <span>⚠</span> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormField;
