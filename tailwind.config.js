
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb', // Light yellow/gold tint
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24', // Gold
          500: '#f59e0b',
          600: '#d97706',
          700: '#1e3a8a', // Blue 900 equivalent for contrast
          800: '#1e40af',
          900: '#172554', // Deep Blue
        },
        bears: {
          blue: '#0033A0',
          gold: '#F2A900',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
