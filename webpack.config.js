const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: path.resolve(__dirname, './client'),
  entry: {
    app: ['./Client.jsx'],
    vendor: ['react','react-dom','isomorphic-fetch','react-router','react-bootstrap','react-router-bootstrap','babel-polyfill','react-select']

  },
  output: {
    path: path.resolve(__dirname, './static'),
    filename: 'app.bundle.js',
  },
  devtool: 'cheap-module-eval-source-map',
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.bundle.js",
      minChunks: Infinity
    })
  ],
  devServer:{
    port: 8000,
    contentBase: 'static',
    proxy:{
      '**': {
        target: 'http://localhost:3000'
      }
    },
    historyApiFallback: true,
  },
  module: {
    rules: [
        {
            test: /\.jsx$/,
            exclude: [/node_modules/],
            use: [ {
                loader: 'babel-loader',
                options: { presets: ['es2015', 'react'] }
            }],
        },
    ],
  },
};