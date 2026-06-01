/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },
        sidebar: {
          bg: '#f8fafc',
          hover: '#f1f5f9',
          active: '#e2e8f0',
          border: '#e2e8f0'
        },
        editor: {
          bg: '#ffffff',
          border: '#e2e8f0'
        }
      },
      width: {
        sidebar: '280px',
        notelist: '320px'
      }
    }
  },
  plugins: []
}
