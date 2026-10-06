/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        correct: '#22c55e',
        partial: '#eab308',
        wrong: '#ef4444',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.2s ease-out',
        'shake': 'shake 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
};
