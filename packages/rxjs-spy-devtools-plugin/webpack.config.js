const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DtsBundleWebpack = require('dts-bundle-webpack')

module.exports = {
  entry: ['./src/index.ts'],
  devtool: 'source-map',
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
  externals: {
    'rxjs': {
      commonjs: 'rxjs',
      commonjs2: 'rxjs',
      amd: 'rxjs'
    },
    'rxjs-spy': {
      commonjs: 'rxjs-spy',
      commonjs2: 'rxjs-spy',
      amd: 'rxjs-spy'
    },
  },
  output: {
    path: `${__dirname}/dist`,
    filename: 'index.js',
    library: 'rxjs-spy-devtools-plugin',
    libraryTarget: 'umd'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new DtsBundleWebpack({
      out: 'index.d.ts',
      name: 'rxjs-spy-devtools-plugin',
      baseDir: 'dist',
      main: 'dist/rxjs-spy-devtools-plugin/src/index.d.ts',
    })
  ]
};