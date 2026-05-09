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
      }
    },
  },
  plugins: [],
}