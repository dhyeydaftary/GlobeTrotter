/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',
          light: '#2A4F7C',
          dark: '#142742',
        },
        accent: {
          DEFAULT: '#FF6B6B',
          hover: '#FF5252',
          light: '#FF8787',
        },
        surface: {
          DEFAULT: '#F8F9FA',
          card: '#FFFFFF',
          muted: '#F1F5F9',
        },
        textMain: '#1A1A2E',
        textMuted: '#6B7280',
        textLight: '#CBD5E1',
        borderLight: '#E5E7EB',
        success: '#10B981',
        warning: '#F59E0B',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'accent-glow': '0 4px 16px rgba(255, 107, 107, 0.4)',
      },
      borderRadius: {
        'card': '20px',
        'btn': '10px',
        'input': '8px',
      },
    },
  },
  plugins: [],
};
