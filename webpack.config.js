const path = require('path');

module.exports = {
  output: {
    path: path.join(__dirname, 'docs/dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js'
  },

  resolve: {
    alias: {
      intermock: path.resolve(__dirname, 'build/index.js'),
    },
  },
  entry: './docs/src/main.ts',
  module: {
    rules: [{
      test: /\.tsx?$/,

      include: path.join(__dirname, 'docs/src'),
      loader: 'ts-loader'
    }]
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'docs/dist'),
    compress: true,
    port: 8080
  },
};