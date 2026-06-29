/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ieee: {
          blue: '#0066cc',
          navy: '#002855',
          light: '#f0f7ff',
          dark: '#0f172a'
        }
      }
    },
  },
  plugins: [],
}
