import type { Config } from "tailwindcss";

// Enable dark mode using class strategy
export default {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      safelist: [
        'bg-primary-blue', 'border-primary-blue', 'text-primary-blue', 'hover:bg-primary-blue/10', 'hover:bg-primary-blue/90', 'focus:ring-primary-blue',
        'bg-primary-red', 'border-primary-red', 'text-primary-red', 'hover:bg-primary-red/90', 'focus:ring-primary-red',
        // Admin safelist
        'admin-theme-blue', 'text-scale-1', 'text-scale-2', 'text-scale-3',
      ],
      colors: {
        // Link utility color names to runtime CSS variables so Tailwind classes
        // like `from-primary-blue` and `to-accent-blue` reflect the current
        // `:root` palette (light/dark modes will switch via the .dark class).
        'primary-blue': 'var(--brand-primary)',
        'accent-blue': 'var(--brand-accent)',

        primary: {
          DEFAULT: '#2563EB', // blue
          red: '#DC2626',
          blue: '#2563EB',
          redHover: '#B91C1C',
          blueHover: '#1D4ED8',
        },
        accent: {
          DEFAULT: '#DC2626', // red
          red: '#EF4444',
          blue: '#3B82F6',
        },
        background: {
          light: '#FFFFFF',
          white: '#FFFFFF',
          dark: '#111827',
        },
        text: {
          primary: '#1E293B',
          secondary: '#475569',
          muted: '#64748B',
          light: '#F8FAFC',
        },
        // Admin specific colors mapped to CSS variables
        admin: {
          bg: 'var(--admin-bg)',
          surface: 'var(--admin-surface)',
          border: 'var(--admin-border)',
          primary: 'var(--admin-primary)',
          text: 'var(--admin-text)',
          muted: 'var(--admin-muted)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'move-random-1': 'moveRandom1 15s linear infinite',
        'move-random-2': 'moveRandom2 15s linear infinite',
        'move-random-3': 'moveRandom3 15s linear infinite',
        'move-random-4': 'moveRandom4 15s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        moveRandom1: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(10vw, 20vh)' },
          '50%': { transform: 'translate(-5vw, 30vh)' },
          '75%': { transform: 'translate(15vw, -10vh)' },
        },
        moveRandom2: {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '25%': { transform: 'translate(-15vw, 10vh)' },
            '50%': { transform: 'translate(10vw, -15vh)' },
            '75%': { transform: 'translate(-5vw, 25vh)' },
        },
        moveRandom3: {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '25%': { transform: 'translate(5vw, -15vh)' },
            '50%': { transform: 'translate(-10vw, 10vh)' },
            '75%': { transform: 'translate(10vw, 20vh)' },
        },
        moveRandom4: {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '25%': { transform: 'translate(10vw, -5vh)' },
            '50%': { transform: 'translate(-15vw, -10vh)' },
            '75%': { transform: 'translate(5vw, 15vh)' },
        },
      }
    },
  },
  plugins: [],
} satisfies Config;
