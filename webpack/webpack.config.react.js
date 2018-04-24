const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: {
    react: [path.join(__dirname, '../src/main.react.js')],
    vue: [path.join(__dirname, '../src/main.vue.js')]
  },
  output: {
    filename: 'bundle.[name].js',
    path: path.join(__dirname, '../public/'),
    publicPath: '/'
  },

  module: {
    rules: [
      { test: /\.jsx?$/, use: ['babel-loader'], exclude: /node_modules/ },
      { test: /\.vue$/, use: ['vue-loader'] }
    ]
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js'
    }
  },
  mode: 'development'
}
