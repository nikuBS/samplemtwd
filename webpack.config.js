var nodeExternals = require('webpack-node-externals');
var path = require('path');
var ManifestPlugin = require('webpack-manifest-plugin');


module.exports = {
  target: 'node',
  externals: [nodeExternals()],
  entry: {
    home: './src/client/app/01.home/home.app.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js'
  },
  plugins: [
      new ManifestPlugin({
        fileName: 'assets.json',
        basePath: '/'
      })
  ]
}

