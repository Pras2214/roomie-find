/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        crimson: {
          50: '#fff1f2',
          100: '#ffe0e3',
          200: '#ffc6cc',
          300: '#ff9aa3',
          400: '#ff5e6e',
          500: '#ff2d42',
          600: '#ed0a21',
          700: '#c80018',
          800: '#990016',
          900: '#7e0418',
          950: '#4a0009',
        },
        cream: '#FDF6EC',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
