/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F2F8F5',
          100: '#E1EFE8',
          200: '#C2DFD2',
          300: '#94C6B3',
          400: '#5EA78E',
          500: '#388B70',
          600: '#2A6F59',
          700: '#235848',
          800: '#1F473B',
          900: '#1C3B32',
          950: '#0C201B',
        },
        sage: {
          50: '#F5F7F5',
          100: '#E7ECE7',
          200: '#D1DBD1',
          300: '#B2C2B3',
          400: '#8DA28F',
          500: '#6C836E',
          600: '#546855',
          700: '#435344',
          800: '#384338',
          900: '#303830',
        },
        graphite: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
