const path = require('path');

module.exports = {
  //   output: {filename: 'main.js', path: path.resolve(__dirname,
  //   'docs/dist')},
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js'
  },

  resolve: {
    alias: {
      intermock: path.resolve(__dirname, 'build/index.js'),
    }
  },
  devtool: 'inline-source-map',
  entry: './docs/src/index.ts',
  module: {rules: [{test: /\.tsx?$/, loader: 'ts-loader'}]},
  resolve: {extensions: ['.ts', '.tsx', '.js']},
  optimization: {splitChunks: {chunks: 'all'}},
  devServer: {
    contentBase: path.join(__dirname, 'docs/dist'),
    compress: true,
    port: 8080
  },
};