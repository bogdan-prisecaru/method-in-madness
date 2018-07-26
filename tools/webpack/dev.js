const path = require('path');
const webpack = require('webpack');

/**
 * Env. vars
 */
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';
const host = 'http://' + hostname + ':' + port;
const assetHost = process.env.ASSET_HOST || host + '/';


module.exports = (config) => {
  console.log(`*** DevServer Host: ${host} ***`);

  return {
    entry: {
      app: [
        // 'webpack-hot-middleware/client',
        'webpack-dev-server/client?' + host,
        'webpack/hot/only-dev-server'
      ]
    },
    mode: 'development',
    plugins: [
      new webpack.DefinePlugin({
        DEVELOPMENT: true
      }),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin()
    ],
    stats: 'errors-only',
    devtool: 'source-map', // or 'eval' or false
    devServer: {
      inline: true,
      port: port,
      publicPath: assetHost, // Make sure publicPath always starts and ends with a forward slash.
      contentBase: [
        path.join(process.cwd(), 'client/src'),
        path.join(process.cwd(), 'dist')
      ],
      clientLogLevel: 'none',
      proxy: {}
    },
    module: {
      rules: [{
        test: /\.(sc|c)ss$/,
        exclude: /node_modules/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }]
      }]
    }
  }

}
