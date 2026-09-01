/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#bcd2ff',
          300: '#8eb4ff',
          400: '#598cff',
          500: '#3266ff',
          600: '#1f47f0',
          700: '#1b39cc',
          800: '#1c33a3',
          900: '#1d2f7e',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b1b8c7',
          400: '#8791a6',
          500: '#677289',
          600: '#525b71',
          700: '#43495b',
          800: '#3a3f4d',
          900: '#1f2330',
        },
      },
      boxShadow: {
        soft: '0 6px 24px -8px rgba(15, 23, 42, 0.10)',
        glow: '0 0 0 4px rgba(50,102,255,0.15)',
      },
    },
  },
  plugins: [],
};
