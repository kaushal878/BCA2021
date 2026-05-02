/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass:
          "0 8px 32px 0 rgba(31, 38, 135, 0.18), inset 0 1px 0 rgba(255,255,255,0.4)",
        "glass-dark":
          "0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
      },
    },
  },
  plugins: [],
};
