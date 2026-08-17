module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#effcfc',
          100: '#d5f7f8',
          200: '#aeeef0',
          300: '#75e1e4',
          400: '#3ed7da',
          500: '#26d3d6',
          600: '#14aab0',
          700: '#12888e',
          800: '#146c72',
          900: '#155a5f',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        panel: '0 10px 30px -10px rgb(15 23 42 / 0.18)',
      },
    },
  },
  plugins: [],
}
