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
          DEFAULT: '#F59E0B', // Amber-500
          hover: '#D97706',   // Amber-600
        },
        secondary: '#FBBF24', // Amber-400
        background: '#FFFFFF',
        surface: '#F9FAFB',   // Gray-50
        accent: '#B45309',    // Amber-700
        'text-primary': '#111827', // Gray-900
        'text-secondary': '#6B7280', // Gray-500
        border: '#E5E7EB',    // Gray-200
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        }
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'premium-hover': '0 20px 40px -12px rgba(0, 0, 0, 0.12), 0 8px 10px -4px rgba(0, 0, 0, 0.04)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}

