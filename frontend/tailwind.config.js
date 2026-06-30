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
        radar: {
          bg: 'hsl(var(--radar-bg))',
          ink: 'hsl(var(--radar-ink))',
          panel: 'hsl(var(--radar-panel))',
          line: 'hsl(var(--radar-line))',
          ice: 'hsl(var(--radar-ice))',
          muted: 'hsl(var(--radar-muted))',
          jade: 'hsl(var(--radar-jade))',
          jadeSoft: 'hsl(var(--radar-jade-soft))',
          amber: 'hsl(var(--radar-amber))',
          coral: 'hsl(var(--radar-coral))',
        },
        subsidy: {
          cream: 'hsl(var(--subsidy-cream))',
          paper: 'hsl(var(--subsidy-paper))',
          ink: 'hsl(var(--subsidy-ink))',
          muted: 'hsl(var(--subsidy-muted))',
          green: 'hsl(var(--subsidy-green))',
          greenDark: 'hsl(var(--subsidy-green-dark))',
          moss: 'hsl(var(--subsidy-moss))',
          gold: 'hsl(var(--subsidy-gold))',
          orange: 'hsl(var(--subsidy-orange))',
          line: 'hsl(var(--subsidy-line))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', '-apple-system', 'sans-serif'],
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
        radarSweep: {
          '0%': { transform: 'rotate(0deg)', opacity: '0.75' },
          '50%': { opacity: '1' },
          '100%': { transform: 'rotate(360deg)', opacity: '0.75' },
        },
        softFloat: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -10px, 0)' },
        },
        orbitSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-slide-in': 'fadeSlideIn 0.25s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'radar-sweep': 'radarSweep 8s linear infinite',
        'soft-float': 'softFloat 6s ease-in-out infinite',
        'orbit-slow': 'orbitSlow 24s linear infinite',
      },
    },
  },
  plugins: [],
}
