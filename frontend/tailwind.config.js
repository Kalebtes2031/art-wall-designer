/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "serif"],
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        "art-primary": {
          50: "#fef7ff",
          100: "#fdeeff",
          200: "#fbdfff",
          300: "#f8bfff",
          400: "#f493ff",
          500: "#ed5fff",
          600: "#d633ff",
          700: "#b91cff",
          800: "#9a1aff",
          900: "#7c1aff",
        },
        "art-secondary": {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        'primary-dark': '#001842',
        'primary-medium': '#1c3c74',
        'primary-light': '#5E89B3',
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: "Inter, system-ui, sans-serif",
            h1: {
              fontFamily: "Playfair Display, serif",
              fontWeight: "700",
            },
            h2: {
              fontFamily: "Playfair Display, serif",
              fontWeight: "600",
            },
            h3: {
              fontFamily: "Poppins, sans-serif",
              fontWeight: "600",
            },
          },
        },
      },
    },
  },
  plugins: [],
};
