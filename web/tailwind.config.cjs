/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["index.html", "./src/**/*.jsx"],
  theme: {
    extend: {
      fontFamily: {
        body: ["Poppins"],
      },
      colors: {
        "purpleNR": '#9C92F8',
        "grayNR": '#E5E5E5'
      }
    },
  },
  plugins: [],
};
