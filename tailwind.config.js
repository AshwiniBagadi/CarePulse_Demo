/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'teal-primary': "#0D9488",
        'navy': "#1E3A5F",
        'sky-accent': "#0EA5E9",
        'amber-warn': "#F59E0B",
        'red-emergency': "#EF4444",
        'slate-bg': "#F8FAFC",
        'slate-dark': "#0F172A",
      },
    },
  },
  plugins: [],
}