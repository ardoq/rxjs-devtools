const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DtsBundleWebpack = require('dts-bundle-webpack')

module.exports = {
  entry: ['./src/index.ts'],
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(ts)$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'ts-loader'],
      },
    ],
  },
  resolve: {
    alias: {
      '@shared': path.resolve('../shared/src/')
    },
    extensions: ['.tsx', '.ts', '.js', '.json'],
  },
  output: {
    path: `${__dirname}/dist`,
    filename: 'index.js',
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
    }),
    new DtsBundleWebpack({
      out: 'index.d.ts',
      name: 'rxjs-spy-devtools-plugin',
      baseDir: 'dist',
      main: 'dist/rxjs-spy-devtools-plugin/src/index.d.ts',
    })
  ]
};