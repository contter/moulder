const path = require('path');
module.exports = {
  content: [
    `${path.join(__dirname, '..')}/src/**/*.{js,jxs,ts,tsx}`,
    '../src/**/*.{js,jxs,ts,tsx}',
    './index.tmpl.html',
    './index.html',
    './src/**/*.{js,jxs,ts,tsx}',
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
