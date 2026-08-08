/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#e8590c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        dharma: {
          black: "#161311",
          charcoal: "#221f1c",
          cream: "#fdf8f1",
          sand: "#f5ece0",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 14px 0 rgba(22, 19, 17, 0.08)",
        lift: "0 12px 30px -8px rgba(22, 19, 17, 0.25)",
      },
      backgroundImage: {
        "saffron-gradient": "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
      },
    },
  },
  plugins: [],
};
