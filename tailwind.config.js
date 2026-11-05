/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Times New Roman"', 'Times', 'serif'],
        sans: ['Arial', 'Helvetica', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      colors: {
        google: {
          blue: '#0000CC',
          red: '#CC0000',
          yellow: '#FFCC00',
          gold: '#D0A600',
          green: '#008000',
          darkGreen: '#002200',
          grey: '#808080',
          border: '#808080',
          lightBg: '#EFEFEF',
          searchBarBg: '#E5ECF9',
        },
      },
    },
  },
  plugins: [],
};
