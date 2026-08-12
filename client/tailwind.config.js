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
        hud: {
          cyan: '#00F0FF',
          'cyan-glow': 'rgba(0, 240, 255, 0.4)',
          gold: '#FFC700',
          'gold-glow': 'rgba(255, 199, 0, 0.4)',
          dark: '#060B13',
          panel: 'rgba(10, 18, 30, 0.85)',
          border: 'rgba(0, 240, 255, 0.2)',
          'border-gold': 'rgba(255, 199, 0, 0.3)',
          red: '#FF2E55',
          green: '#00FF85',
          blue: '#1E6FFF',
        },
        'pure-black': '#030712',
        'off-black': '#0B1120',
        'pure-white': '#F8FAFC',
        'off-white': '#E2E8F0',
        grayscale: {
          950: '#060B13',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        danger: {
          muted: '#7F1D1D',
          border: '#451A1A',
          bg: '#1A0C0C',
          'light-bg': '#FEF2F2',
          'light-border': '#FECACA',
          'light-text': '#991B1B',
        }
      },
      fontFamily: {
        hud: ['Orbitron', 'sans-serif'],
        display: ['Rajdhani', 'Orbitron', 'sans-serif'],
        sans: ['Inter', '"Space Grotesk"', 'sans-serif'],
        serif: ['Inter', '"Space Grotesk"', 'sans-serif'], // smooth fallbacks
      },
      boxShadow: {
        'hud-cyan': '0 0 20px rgba(0, 240, 255, 0.25), inset 0 0 15px rgba(0, 240, 255, 0.1)',
        'hud-cyan-lg': '0 0 35px rgba(0, 240, 255, 0.4), inset 0 0 25px rgba(0, 240, 255, 0.15)',
        'hud-gold': '0 0 20px rgba(255, 199, 0, 0.25), inset 0 0 15px rgba(255, 199, 0, 0.1)',
        'hud-gold-lg': '0 0 35px rgba(255, 199, 0, 0.4), inset 0 0 25px rgba(255, 199, 0, 0.15)',
        'hud-red': '0 0 20px rgba(255, 46, 85, 0.3)',
        'hud-green': '0 0 20px rgba(0, 255, 133, 0.3)',
        'elevation-resting': '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 240, 255, 0.15)',
        'elevation-hover': '0 8px 30px rgba(0, 240, 255, 0.25), 0 0 0 1px rgba(0, 240, 255, 0.4)',
      },
      letterSpacing: {
        'widest-hud': '0.25em',
        'tightest': '-0.035em',
      }
    },
  },
  plugins: [],
}
