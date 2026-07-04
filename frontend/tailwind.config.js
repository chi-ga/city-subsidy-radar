/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        paper: 'hsl(var(--paper))',
        ink: 'hsl(var(--ink))',
        'civic-blue': {
          DEFAULT: 'hsl(var(--civic-blue))',
          foreground: 'hsl(var(--civic-blue-foreground))',
        },
        'seal-red': {
          DEFAULT: 'hsl(var(--seal-red))',
          foreground: 'hsl(var(--seal-red-foreground))',
        },
        celadon: 'hsl(var(--celadon))',
        amber: 'hsl(var(--amber))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Noto Serif SC', 'Songti SC', 'SimSun', 'serif'],
        data: ['Roboto Mono', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      keyframes: {
        fadeSlideIn: {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        radarPulse: {
          '0%': { transform: 'scale(0.8)', opacity: '0.35' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-slide-in': 'fadeSlideIn 0.25s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'radar-pulse': 'radarPulse 2.4s ease-out infinite',
        'radar-sweep': 'radarSweep 3s linear infinite',
      },
    },
  },
  plugins: [],
}