/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Times New Roman', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      colors: {
        google: {
          blue: '#1a0dab',
          green: '#006621',
          grey: '#545454',
          border: '#dfe1e5',
          lightBg: '#f8f9fa',
          accent: '#4285f4',
          yellow: '#fbbc05',
          red: '#ea4335',
        },
      },
    },
  },
  plugins: [],
};

