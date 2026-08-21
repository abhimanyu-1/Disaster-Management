/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'diq-bg': '#0B0F19',
        'diq-panel': '#111827',
        'diq-line': '#374151',
        'diq-orange': '#f97316',
      },
      fontFamily: {
        'sans': ['system-ui', 'sans-serif'],
        'label': ['system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
