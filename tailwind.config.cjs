// Menggunakan format .cjs agar tidak konflik dengan "type": "module"
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        checkmark: {
          '0%': { 'stroke-dashoffset': '100%' },
          '100%': { 'stroke-dashoffset': '0%' },
        },
      },
      animation: {
        checkmark: 'checkmark 0.4s ease-in-out forwards',
      },
    },
  },
  plugins: [],
};