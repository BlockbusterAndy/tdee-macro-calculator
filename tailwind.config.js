/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#111111',
        card: '#161616',
        border: '#222222',
        accent: '#c8f135',
        text: '#f0f0f0',
        muted: '#666666',
        protein: '#c8f135',
        carbs: '#38bdf8',
        fat: '#fb923c',
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'cursive'],
        dm: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
