/**
 * Shared motion primitives for GlobeTrotter.
 *
 * All animation spring configs live here so every section uses the same
 * physical "feel" instead of ad-hoc durations scattered per element.
 */

// ------------------------------------------------------------
// Spring configs
// ------------------------------------------------------------

/** Critically damped — default for passive scroll-reveal entrances. */
export const springSettle = { type: 'spring', bounce: 0, duration: 0.5 };

/**
 * Slight bounce — reserved ONLY for elements that follow a user gesture
 * (button press feedback, hover interactions). Never for a passive scroll-reveal.
 */
export const springMomentum = { type: 'spring', bounce: 0.2, duration: 0.4 };

// ------------------------------------------------------------
// Stagger container / item variants
// ------------------------------------------------------------

/** Parent container — children animate in sequence, not simultaneously. */
export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** Slightly wider stagger for sequentially-read content (e.g. "How It Works"). */
export const staggerContainerSlow = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

/** Standard fade-up child item using the critically-damped spring. */
export const fadeUpItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: springSettle },
};

/** Scale-in variant for cards/panels. */
export const scaleInItem = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: springSettle },
};

// ------------------------------------------------------------
// Reduced-motion aware props factory
// ------------------------------------------------------------

/**
 * Returns animation props (initial / animate or whileInView) based on the
 * user's `prefers-reduced-motion` preference. Call this once per section —
 * do NOT duplicate the check per element.
 *
 * @param {boolean} reduceMotion - from useReducedMotion()
 * @param {'mount' | 'scroll'} trigger
 *   'mount'  → plays on initial render (use for above-the-fold hero)
 *   'scroll' → plays when scrolled into view (use for below-fold sections)
 */
export const getMotionProps = (reduceMotion, trigger = 'scroll') => {
  if (reduceMotion) {
    // Render immediately in final state — no stagger, no fade.
    return { initial: 'show', animate: 'show' };
  }

  if (trigger === 'mount') {
    return { initial: 'hidden', animate: 'show' };
  }

  // scroll (whileInView)
  return {
    initial: 'hidden',
    whileInView: 'show',
    viewport: { once: true, amount: 0.15 },
  };
};
