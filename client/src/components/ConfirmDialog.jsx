import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { springSettle } from '../lib/motion';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  const panelMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : {
        initial: { opacity: 0, scale: 0.94 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
        transition: springSettle,
      };
  const tapProps = reduceMotion ? {} : { whileTap: { scale: 0.97 }, transition: springSettle };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduceMotion ? { duration: 0.15 } : springSettle}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          onClick={onCancel}
        >
          <motion.div
            className="gt-glass-panel w-full max-w-md rounded-card p-6 sm:p-7"
            style={{ transformOrigin: 'center' }}
            {...panelMotion}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-dialog-title" className="text-display-md text-lg font-bold text-text-main">
              {title}
            </h2>
            <p className="text-sm text-text-muted mt-2 leading-relaxed">{message}</p>
            <div className="flex justify-end gap-3 mt-6">
              <motion.button
                type="button"
                onClick={onCancel}
                disabled={loading}
                {...tapProps}
                className="px-4 py-2.5 text-xs font-semibold text-text-muted border border-border-light rounded-btn hover:bg-surface-raised hover:text-text-main transition-colors"
              >
                {cancelLabel}
              </motion.button>
              <motion.button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                {...tapProps}
                className="px-5 py-2.5 text-xs font-bold text-white bg-danger hover:bg-red-600 rounded-btn shadow-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
