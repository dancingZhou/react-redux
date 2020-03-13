var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var webpack = require('webpack')

module.exports = {
  entry: './demo/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name]-[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9009
  },
  mode: 'development',
  plugins: [
    new HtmlWebpackPlugin({
      template: './demo/index.html'
    })
  ]
}
