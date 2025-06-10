// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        gugi: ['Gugi', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        orbit: {
          '0%':  { transform: 'rotate(0deg) translateX(150px) rotate(0deg)' },
          '100%':{ transform: 'rotate(360deg) translateX(150px) rotate(-360deg)' },
        },
      },
      animation: {
        'gradient-anim':    'gradient-shift 15s ease infinite',
        'float-slow':       'float 6s ease-in-out infinite',
        'orbit-slow':       'orbit 12s linear infinite',
      },
    },
  },
  plugins: [],
};
