/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(63, 125, 88)',
        light: 'rgb(239, 239, 239)',
        warning: 'rgb(239, 150, 81)',
        danger: 'rgb(236, 82, 40)',
      },
      animation: {
        // Ánh sáng lướt qua mặt chữ liên tục
        'shine': 'shine 2.5s linear infinite',
        // Dòng slogan hiện dần lên
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
      },
      keyframes: {
        shine: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(15px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}