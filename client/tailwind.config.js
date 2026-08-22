/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Accent — indigo/blue-violet, the ONE confident color
        accent: '#5B5BF6',
        'accent-dark': '#4746E0',
        'accent-hover': '#4746E0',
        'accent-light': '#EEEEFE',   // tint for badges/backgrounds behind accent text
        'accent-glow': 'rgba(91,91,246,0.35)',

        // Neutral surface system (light mode)
        surface: '#FAFAFC',          // page background
        'surface-card': '#FFFFFF',   // card background
        'surface-raised': '#F4F4F8', // hover/active surface
        'surface-dark': '#14141F',   // reserved for landing-page hero only

        // Text
        'text-main': '#15161F',
        'text-primary': '#15161F',   // alias — kept so existing usage doesn't break
        'text-muted': '#6B6B7B',
        'text-light': '#9797A8',

        // Borders / hairlines
        'border-light': '#E9E9F0',
        'border-strong': '#D5D5E0',

        // Semantic (unchanged use-cases, restyled to sit next to indigo)
        success: '#1FAE7A',
        warning: '#E0A930',
        danger: '#E5484D',
      },
      borderRadius: {
        card: '20px',
        btn: '12px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,15,30,0.04), 0 8px 24px rgba(15,15,30,0.06)',
        'card-hover': '0 4px 12px rgba(15,15,30,0.06), 0 16px 40px rgba(15,15,30,0.10)',
        'btn-accent': '0 4px 14px rgba(91,91,246,0.35)',
        'accent-glow': '0 0 0 4px rgba(91,91,246,0.16), 0 4px 14px rgba(91,91,246,0.35)',
        glass: '0 8px 32px rgba(15,15,30,0.08)',
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
};
