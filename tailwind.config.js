/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1890FF',
        danger: '#FF4D4F',
        warning: '#FF7A45',
        success: '#52C41A',
        'gray-bg': '#F0F2F5',
        'sidebar-dark': '#001529',
        'sidebar-hover': '#1890FF',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"Source Han Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
