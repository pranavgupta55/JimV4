/** @type {import('tailwindcss').Config} */
export default {
  content:[
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#101014',
        surfaceHighlight: '#1a1a1c',
        accent: '#38bdf8', // Bright blue from the diagrams
      }
    },
  },
  plugins:[],
}
