/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        brand: "#0E514F",
        bgMain: "#FFFFFE",
        iconGold: "#FFF5B3",
      },
    },
  },
  plugins: [],
};
