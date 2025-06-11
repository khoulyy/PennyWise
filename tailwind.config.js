// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        gugi: ['Gugi', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        pennywise: {
          primary: '#0ABAB5',    // Deep teal
          secondary: '#56DFCF',  // Bright teal
          accent: '#ADEED9',     // Light teal
          pink: '#FFEDF3',       // Soft pink
          // Additional shades for gradients and hover states
          'primary-dark': '#099A95',
          'primary-light': '#0BCBC5',
          'secondary-dark': '#45CFBF',
          'secondary-light': '#67EFDF',
          'accent-dark': '#9DDEBF',
          'accent-light': '#BDFEE9',
          'pink-dark': '#FFDDE3',
          'pink-light': '#FFFDFF',
        }
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(20px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(20px) rotate(-360deg)' },
        },
      },
      animation: {
        'gradient-anim': 'gradient 15s ease infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'orbit-slow': 'orbit 20s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
