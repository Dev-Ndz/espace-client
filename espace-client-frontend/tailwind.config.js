/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        "text-color": "var(--color-text)",
        "background-color": "var(--color-background)",
      },
      fontFamily: {
        sans: ["'Source Sans 3'", ...defaultTheme.fontFamily.sans],
        mono: ["Fragment Mono", ...defaultTheme.fontFamily.mono],
      },
      letterSpacing: {
        wide: ".0625rem",
        wider: ".125rem",
        widest: ".25rem",
      },
    },
  },
  plugins: [],
};
