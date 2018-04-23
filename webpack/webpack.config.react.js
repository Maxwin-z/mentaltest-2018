const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: {
    react: [path.join(__dirname, '../src/main.react.js')]
  },
  output: {
    filename: 'bundle.[name].js',
    path: path.join(__dirname, '../public/'),
    publicPath: '/'
  },

  module: {
    rules: [{ test: /\.jsx?$/, use: ['babel-loader'], exclude: /node_modules/ }]
  },
  mode: 'development'
}
