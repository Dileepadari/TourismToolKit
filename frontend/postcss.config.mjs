/**
 * PostCSS configuration
 * Processes CSS with Tailwind and autoprefixer for cross-browser compatibility
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {
      flexbox: "no-2009",
      grid: "autoplace",
    },
  },
};

export default config;
