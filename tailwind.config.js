/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1A56FF',
          yellow: '#F5C842',
          red: '#DC1F3B',
          dark: '#020202',
          surface: '#0A0A0A',
          surfaceHover: '#111111',
          light: '#F4F4F5'
        },
        astrix: {
          teal: '#20808D',
          terra: '#A84B2F',
          darkTeal: '#1B474D',
          gold: '#FFC553',
          olive: '#848456'
        },
        sidebar: {
          dark: '#0f172a',
          hover: '#1e293b',
          active: '#20808D'
        }
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'fluid-1': 'clamp(2rem, 6vw, 5rem)',
        'fluid-2': 'clamp(2.5rem, 8vw, 7.5rem)',
        'fluid-3': 'clamp(2.75rem, 10vw, 11rem)',
      },
      boxShadow: {
        'apple': '0 20px 40px -15px rgba(0,0,0,0.05), 0 0 10px rgba(0,0,0,0.01)',
        'apple-hover': '0 30px 60px -15px rgba(0,0,0,0.08), 0 0 15px rgba(0,0,0,0.02)',
        'glow-blue': '0 0 40px -10px rgba(26,86,255,0.4)',
      },
      animation: {
        'blob': 'blob 15s infinite alternate',
        'ticker': 'ticker 40s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'spin-slow': 'spin 20s linear infinite',
        'shine': 'shine 2s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(50px, -50px) scale(1.2)' },
          '100%': { transform: 'translate(-30px, 30px) scale(0.9)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shine: {
          '100%': { left: '125%' },
        }
      }
    }
  },
  plugins: [],
};
