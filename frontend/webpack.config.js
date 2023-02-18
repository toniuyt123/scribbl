const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/js/main.js',
  node: false,
  output: {
    filename: 'js/index.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Skribbl',
      template: "./src/index.html"
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.m?js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"], // ensure compatibility with older browsers
            plugins: ["@babel/plugin-transform-object-assign"], // ensure compatibility with IE 11
          },
        },
      },
    ],
  },
};