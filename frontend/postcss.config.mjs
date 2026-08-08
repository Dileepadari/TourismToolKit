/**
 * PostCSS configuration.
 *
 * autoprefixer is deliberately absent: Tailwind v4's PostCSS plugin runs
 * Lightning CSS, which already applies vendor prefixes per browserslist.
 * Running autoprefixer afterwards is redundant and can re-mangle v4 output.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
