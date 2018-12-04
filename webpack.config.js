const path = require('path');

module.exports = {
  entry: './docs/src/main.ts',

  output: {
    path: path.join(__dirname, 'docs/dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js'
  },

  resolve: {
    extensions: ['.js', '.ts'],

    //  alias: {
    //    intermock: path.resolve(__dirname, 'build/index.js'),
    //  },
  },

  module: {
    loaders: [{
      test: /\.ts$/,
      include: path.join(__dirname),
      loader: 'ts-loader',
      options: {configFile: 'docs/tsconfig.json'}
    }]
  },

  devServer: {
    contentBase: './docs/dist',
    port: 8080,
  },
};

// module.exports = {
//   output: {
//     path: path.join(__dirname, 'docs/dist'),
//     filename: '[name].bundle.js',
//     chunkFilename: '[name].chunk.js'
//   },

//   resolve: {
//     alias: {
//       intermock: path.resolve(__dirname, 'build/index.js'),
//     },
//   },
//   entry: './docs/src/main.ts',
//   module: {
//     rules: [{
//       test: /\.tsx?$/,
//       include: path.join(__dirname, 'docs/src'),
//       loader: 'ts-loader'
//     }]
//   },
//   devtool: 'inline-source-map',
//   //   optimization: {splitChunks: {chunks: 'all'}},
//   devServer: {
//     contentBase: path.join(__dirname, 'docs/dist'),
//     //  compress: true,
//     port: 8080
//   },
// };