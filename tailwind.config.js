/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        btp: {
          dark: '#0F172A',
          navy: '#1E293B',
          slate: '#334155',
          muted: '#64748B',
          border: '#E2E8F0',
          bg: '#F8FAFC',
          card: '#FFFFFF',
          orange: '#F97316',
          'orange-dark': '#EA580C',
          'orange-light': '#FFEDD5',
          gold: '#D97706',
          emerald: '#10B981',
          rose: '#EF4444'
        }
      }
    },
  },
  plugins: [],
}
