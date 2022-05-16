const { resolve } = require('path');

module.exports = {
  plugins: {
    tailwindcss: { config: resolve(__dirname, 'dist', 'tailwind.config.js') },
    autoprefixer: {},
  },
};
