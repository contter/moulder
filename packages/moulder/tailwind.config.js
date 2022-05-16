const path = require('path');
module.exports = {
  content: [
    `${path.join(__dirname, '..')}/src/**/*.{js,ts}`,
    '../src/**/*.{js,ts}',
    './index.tmpl.html',
    './index.html',
    './src/**/*.{js,ts}',
  ],
  plugins: [require('daisyui')],
  theme: {
    extend: {
      colors: {
        blackOpacity: 'rgba(0, 0, 0, 0.3)',
      },
    },
  },
};
