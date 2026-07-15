/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tastyc: {
          dark: '#0a1316',
          card: '#121e22',
          copper: '#d68240',
          copperLight: '#e29d66',
          textMuted: '#a9b8c3',
        }
      },
      fontFamily: {
        title: ['Italiana', 'serif'],
        body: ['"Josefin Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
