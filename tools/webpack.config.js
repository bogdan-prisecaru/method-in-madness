const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

/**
 * Vars
 */
const METADATA = {
  baseUrl: '/',
  title: 'The glorious dead!'
}

/**
 * Plugins
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function(config) {
  let _CONFIG_ = { // default config if nothing is passed from CLI
    environment: (config && config.environment) ? config.environment : 'dev',
    theme: (config && config.theme) ? config.theme : 'default'
  };

  console.info(`*** Environment: ${_CONFIG_.environment} ***`);
  console.info(`*** Theme: ${_CONFIG_.theme} ***`);

  return merge({
    entry: {
      polyfill: [
        path.resolve(path.join(process.cwd(), 'client/src/polyfill.ts'))
      ],
      app: [
        path.resolve(path.join(process.cwd(), 'client/src/main.ts'))
      ]
    },
    output: {
      path: path.join(process.cwd(), 'dist'),
      filename: '[name].js',
      chunkFilename: '[chunkhash].[name].js'
    },
    plugins: [
      new webpack.ContextReplacementPlugin(/\@angular(\\|\/)core(\\|\/)esm5/, path.join(process.cwd(), 'client/src')),
      new HtmlWebpackPlugin({
        chunksSortMode: function(a, b) {
          const entryPoints = ['polyfill', 'vendor', 'app'];
          return entryPoints.indexOf(a.names[0]) - entryPoints.indexOf(b.names[0]);
        },
        inject: 'body', // we need set to body for ng4 - otherwise it breaks
        metadata: METADATA,
        template: path.resolve(path.join(process.cwd(), 'client/src/index.ejs')),
      })
    ],
    resolve: {
      alias: {
        '@bootstrap': path.resolve(path.join(process.cwd(), 'client/src/bootstrap')),
        '@modules': path.resolve(path.join(process.cwd(), 'client/src/modules')),
        '@shared': path.resolve(path.join(process.cwd(), 'client/src/shared')),
        '@ui': path.resolve(path.join(process.cwd(), 'client/src/ui')),
        '@server': path.resolve(path.join(process.cwd(), 'server')),
      },
      extensions: ['.ts', '.js', '.css', '.scss', '.html', '.json'],
      modules: ['node_modules', 'client/src', 'server', 'tools']
    },
    module: {
      rules: [{
        test: /\.html$/,
        exclude: /node_modules/,
        use: [{
          loader: 'html-loader'
        }]
      }, {
        test: /\.ts$/,
        exclude: [/\.(spec|e2e)\.ts$/],
        use: [{
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            experimentalWatchApi: true,
          }
        }, {
          loader: 'angular2-template-loader'
        }]
      }, {
        test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
        parser: {
          system: true
        }
      }]
    }
  }, require('./webpack/' + _CONFIG_.environment)(_CONFIG_));
}
