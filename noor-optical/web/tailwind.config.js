/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: 'rgb(var(--navy) / <alpha-value>)',
          deep: 'rgb(var(--navy-deep) / <alpha-value>)',
          soft: 'rgb(var(--navy-soft) / <alpha-value>)',
        },
        ivory: 'rgb(var(--ivory) / <alpha-value>)',
        paper: 'rgb(var(--paper) / <alpha-value>)',
        champagne: {
          DEFAULT: 'rgb(var(--champagne) / <alpha-value>)',
          light: 'rgb(var(--champagne-light) / <alpha-value>)',
          dark: 'rgb(var(--champagne-dark) / <alpha-value>)',
        },
        ink: 'rgb(var(--ink) / <alpha-value>)',
        slate: {
          DEFAULT: 'rgb(var(--slate) / <alpha-value>)',
          light: 'rgb(var(--slate-light) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--line) / <alpha-value>)',
          strong: 'rgb(var(--line-strong) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Vazirmatn', 'system-ui', 'sans-serif'],
        display: ['Inter', 'Vazirmatn', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: ['clamp(2.5rem, 6vw, 4.75rem)', { lineHeight: '1.03', letterSpacing: '-0.03em' }],
        display: ['clamp(1.9rem, 3.4vw, 3rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        section: ['clamp(1.5rem, 2.4vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
      },
      letterSpacing: {
        label: '0.18em',
        wide2: '0.08em',
      },
      boxShadow: {
        soft: '0 18px 50px -30px rgb(var(--navy) / 0.35)',
        panel: '0 30px 80px -40px rgb(var(--navy-deep) / 0.45)',
      },
      borderRadius: {
        card: '2px',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'scale(1.06)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(var(--drawer-from, 100%))' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        rise: 'rise 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
        fade: 'fade 500ms ease both',
        reveal: 'reveal 900ms cubic-bezier(0.22, 1, 0.36, 1) both',
        slideIn: 'slideIn 320ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      transitionTimingFunction: {
        focus: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
