/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f6ffe8',
        surface: '#fffacd',
        primary: '#adff2f',
        primaryDark: '#2e8b57',
        secondary: '#90ee90',
        textMain: '#1a1f16',
        textMuted: '#4a5d23'
      },
      boxShadow: {
        neon: '0 0 10px #adff2f, 0 0 20px #90ee90',
        'neon-strong': '0 0 15px #adff2f, 0 0 30px #2e8b57',
        glass: '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: '1', textShadow: '0 0 10px #adff2f' },
          '50%': { opacity: '0.5', textShadow: 'none' },
        }
      }
    },
  },
  plugins: [],
}
