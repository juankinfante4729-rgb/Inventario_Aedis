/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",        // Busca en la raíz (para tu App.tsx)
    "./components/**/*.{js,ts,jsx,tsx}", // Busca en tu carpeta components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}