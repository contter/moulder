// vite.config.js
const { defineConfig } = require('vite');
const path = require("path");

module.exports = defineConfig({
  root: __dirname,
  base: './',
  build: {
    assetsDir: '',
    minify: false
  },
  plugins: []
});

