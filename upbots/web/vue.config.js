const webpack = require("webpack");

module.exports = {
  devServer: {
    disableHostCheck: true,
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      analyzerMode: "disabled",
      openAnalyzer: false, // set true to open analyzer
    },
  },
  pwa: {
    workboxOptions: {
      skipWaiting: true, // forces PWA to use new update service worker (Safari mainly)
      clientsClaim: true,
    },
  },
  configureWebpack: {
    plugins: [
      // Ignore all locale files of moment.js - https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],
  },
};
