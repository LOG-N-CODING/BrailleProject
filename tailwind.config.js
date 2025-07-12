/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#2575FF',
          600: '#164699',
        },
        secondary: {
          500: '#FF7725',
        },
        success: {
          500: '#25FF99',
        },
        danger: {
          500: '#FF696C',
        },
      },
      fontFamily: {
        'irish': ['Irish Grover', 'cursive'],
        'noto': ['Noto Sans', 'sans-serif'],
        'digital': ['Digital Numbers', 'monospace'],
      },
    },
  },
  plugins: [],
}
