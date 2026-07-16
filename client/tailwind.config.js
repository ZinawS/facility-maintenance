/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#3B82F6",
          DEFAULT: "#1E40AF",
          dark: "#15306E",
        },
        "primary-light": "#3B82F6",
        "primary-dark": "#15306E",
        secondary: "#1E3A8A",
        accent: "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
