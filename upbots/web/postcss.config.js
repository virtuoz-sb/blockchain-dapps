const purgecss = require("@fullhuman/postcss-purgecss");
const autoprefixer = require("autoprefixer");
const tailwindcss = require("tailwindcss");
const purgecssConfig = {
  content: [
    "./public/**/*.html",
    "./src/assets/styles/**/*.css",
    "./src/**/*.html",
    "./src/**/*.vue",
    "./node_modules/vue-select/src/**/*.vue",
  ],
  whitelist: [],
  whitelistPatterns: [/swiper-/gm],
  extractors: [
    {
      extractor: (content) => content.match(/[A-Za-z0-9-+_:/]+/g) || [],
      extensions: ["html", "vue", "js", "css"],
    },
  ],
};
module.exports = {
  plugins: [tailwindcss, autoprefixer(), ...(process.env.NODE_ENV === "production" ? [purgecss(purgecssConfig)] : [])],
};
