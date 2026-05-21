/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc5fb",
          400: "#36a6f6",
          500: "#0c8ae7",
          600: "#006dc5",
          700: "#0057a0",
          800: "#044c85",
          900: "#0a406e",
          950: "#072849",
        },
        accent: {
          DEFAULT: "#f97316",
          light: "#fdba74",
          dark: "#c2410c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        section: "5rem",
      },
    },
  },
  plugins: [],
};
