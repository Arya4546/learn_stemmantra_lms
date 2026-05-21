/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        outfit: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#EA580C', // Premium Orange/Amber-600
          hover: '#C2410C',   // Amber-700
          light: '#FFEDD5',   // Amber-100
        },
        secondary: '#F97316', // Orange-500
        background: '#F8FAFC', // Slate-50
        surface: '#FFFFFF',
        accent: '#475569',    // Slate-600
        'text-primary': '#0F172A', // Slate-900
        'text-secondary': '#64748B', // Slate-500
        border: '#E2E8F0',    // Slate-200
        brandDark: '#0A0F1D', // Premium Dark blue-slate for cards/sidebars
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
      animation: {
        shake: 'shake 0.3s ease-in-out',
        float: 'float 4s ease-in-out infinite',
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(10, 15, 29, 0.06), 0 4px 6px -2px rgba(10, 15, 29, 0.02)',
        'premium-hover': '0 20px 40px -12px rgba(10, 15, 29, 0.10), 0 8px 10px -4px rgba(10, 15, 29, 0.03)',
        'glow-primary': '0 0 20px rgba(234, 88, 12, 0.15)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
