// vite.config.js
const { defineConfig } = require('vite');
import react from '@vitejs/plugin-react';
// const path = require('path');
module.exports = defineConfig({
  root: __dirname,
  base: './',
  build: {
    assetsDir: '',
    minify: false,
  },
  plugins: [react()],
});
