const path = require('path');
var webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
var prettierPlugin = require('prettier-webpack-plugin');
var typedocPlugin = require('typedoc-webpack-plugin');


module.exports = {
  entry: './ts/main.ts',
  mode: 'production',
  devtool: 'source-map',
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
        {
            test: /\.ts$/,
            include : path.resolve(__dirname, 'ts'),
            use: [{
              loader: 'expose-loader',
              options: 'ABlk'
              }, {
                loader: 'ts-loader'
            }]
        }
    ]
  },
  output: {
    filename: 'aniblock.js',
    path: path.resolve(__dirname, 'www', 'dist')
  },
  plugins: [
    new prettierPlugin({
      printWidth: 100,
      tabWidth: 4,
      useTabs: false,
      trailingComma: "es5",
      semi: true,
      singleQuote: true
    }),
    new typedocPlugin({
      mode: 'file',
      out: '../../docs',
      excludeExternals: true,
      excludePrivate: true,
      readme: 'READMEGP.md',
      media: 'media'
    }),
    new CleanWebpackPlugin(),
    new CopyPlugin([{
        from: path.resolve(__dirname, 'ts', 'style.css'),
        to: path.resolve(__dirname, 'www', 'dist', 'aniblock.css')
    }])
  ],
};