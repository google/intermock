const path = require('path');

module.exports = {
  entry: './docs/src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'docs/dist')
  },
  devServer: {
    contentBase: path.join(__dirname, 'docs/dist'),
    compress: true,
    port: 8080
  }
};