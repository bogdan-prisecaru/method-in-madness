const path = require('path');
const webpack = require('webpack');
const alias = require('./alias');
/**
 * Env. vars
 */
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';
const host = 'http://' + hostname + ':' + port;
const assetHost = process.env.ASSET_HOST || host + '/';

module.exports = (config) => {
  return {
    entry: {
      app: [
        'webpack-dev-server/client?' + host,
        'webpack/hot/only-dev-server'
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        DEVELOPMENT: true
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'polyfill',
        chunks: ['polyfill']
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
        path.join(process.cwd(), alias.path.client),
        path.join(process.cwd(), alias.path.dist)
      ],
      clientLogLevel: 'none',
      noInfo: true,
      historyApiFallback: {
        disableDotRule: true,
        proxy: {} // for proxy check webpack documentation
      }
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader'
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: false,
                includePaths: []
              }
            }
          ]
        }
      ]
    }
  }
}
