/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        'timer': ['5rem', { lineHeight: '1', fontWeight: '700' }],
        'huge': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'big': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
      },
      colors: {
        surface: '#1e293b',
        'surface-light': '#334155',
        accent: '#22c55e',
        'accent-dim': '#166534',
        danger: '#ef4444',
        warn: '#f59e0b',
      }
    },
  },
  plugins: [],
};
