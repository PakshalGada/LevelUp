/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070a11',
          900: '#0b0f19',
          850: '#0f172a',
          800: '#131b2e',
          700: '#1e293b',
          600: '#334155',
        },
        neon: {
          green: '#00ff9d',
          cyan: '#00f0ff',
          gold: '#ffd700',
          purple: '#a855f7',
          pink: '#ff007f',
        },
        game: {
          xp: '#10b981',
          streak: '#f97316',
          badge: '#f59e0b',
          card: '#182238',
          border: '#2a3859',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neon-green': '0 0 15px rgba(0, 255, 157, 0.4)',
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.4)',
        'neon-gold': '0 0 15px rgba(255, 215, 0, 0.4)',
        'neon-purple': '0 0 15px rgba(168, 85, 247, 0.4)',
        'card-glow': '0 4px 20px -2px rgba(0, 240, 255, 0.1)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.6))' },
          '50%': { opacity: 0.7, filter: 'drop-shadow(0 0 2px rgba(0, 240, 255, 0.2))' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
