/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          light: "var(--color-primary-light)",
        },
        bg: "var(--color-bg)",
        text: {
          main: "var(--color-text-main)",
          sub: "var(--color-text-sub)",
        },
        error: "var(--color-error)",
      },
      borderRadius: {
        lg: "20px",
        md: "12px",
        sm: "8px",
      },
    },
  },
  plugins: [],
};
