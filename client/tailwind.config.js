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
        'pure-black': '#000000',
        'off-black': '#0A0A0A',
        'pure-white': '#FFFFFF',
        'off-white': '#FAFAFA',
        grayscale: {
          950: '#0D0D0D',
          900: '#171717',
          800: '#262626',
          700: '#404040',
          600: '#525252',
          500: '#737373',
          400: '#A3A3A3',
          300: '#D4D4D4',
          200: '#E5E5E5',
          100: '#F5F5F5',
          50: '#FAFAFA',
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
        serif: ['"Noto Serif"', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['"Noto Serif"', 'Georgia', 'serif'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '18px',
        '2xl': '24px',
      },
      boxShadow: {
        'elevation-resting': '0 2px 10px -2px rgba(0, 0, 0, 0.04), 0 1px 3px -1px rgba(0, 0, 0, 0.02)',
        'elevation-hover': '0 16px 36px -6px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'elevation-active': '0 2px 6px -1px rgba(0, 0, 0, 0.06)',
        'elevation-dark-resting': '0 2px 10px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'elevation-dark-hover': '0 16px 36px -6px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.15)',
      },
      letterSpacing: {
        'tightest': '-0.035em',
        'tighter': '-0.025em',
        'tight': '-0.015em',
      }
    },
  },
  plugins: [],
}

