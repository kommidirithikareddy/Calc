/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        hero:    ['Plus Jakarta Sans', 'sans-serif'],
        section: ['Space Grotesk', 'sans-serif'],
        logo:    ['Manrope', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        accent: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        finance:     { light: '#e0e7ff', DEFAULT: '#6366f1', dark: '#4f46e5'  },
        health:      { light: '#d1fae5', DEFAULT: '#10b981', dark: '#059669'  },
        engineering: { light: '#fef3c7', DEFAULT: '#f59e0b', dark: '#d97706'  },
        math:        { light: '#dbeafe', DEFAULT: '#3b82f6', dark: '#2563eb'  },
        // ✅ FINAL: Teal
        utilities:   { light: '#eafffd', DEFAULT: '#0d9488', dark: '#0f766e'  },
        surface: {
          50:  '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
          300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b',
          600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a',
        },
        dark: {
          bg: '#0a0a14', card: '#12121e', raised: '#1a1a2e',
          border: '#1e1e3a', border2: '#2d2d4e',
        },
      },
      boxShadow: {
        'accent':     '0 4px 20px rgba(99,102,241,0.35)',
        'accent-lg':  '0 8px 32px rgba(99,102,241,0.4)',
        'card':       '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.10)',
      },
      animation: {
        'fade-up':    'fadeUp 0.4s ease both',
        'fade-in':    'fadeIn 0.3s ease both',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:    { '0%': { opacity: 0, transform: 'translateY(12px)' },  '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp:   { '0%': { opacity: 0, transform: 'translateY(24px) scale(0.98)' }, '100%': { opacity: 1, transform: 'translateY(0) scale(1)' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0)' }, '50%': { boxShadow: '0 0 0 8px rgba(99,102,241,0.15)' } },
      },
    },
  },
  plugins: [],
}
