const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const alias = require('./webpack/alias');

/**
 * Metadata
 */
const METADATA = {
  title: 'Angular 5 App',
  baseUrl: '/',
};

/**
 * Plugins
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HappyPack = require('happypack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = function(config) {
  let _CONFIG_ = { // default config if nothing is passed from CLI
    environment: (config && config.environment) ? config.environment : 'dev',
    theme: (config && config.theme) ? config.theme : 'default'
  };
  console.info('*** Environment', _CONFIG_.environment);
  console.info('*** Theme', _CONFIG_.theme);

  return merge({
    entry: {
      polyfill: [
        path.resolve(`${alias.path.client}/polyfill.ts`),
      ],
      app: [
        path.resolve(`${alias.path.client}/main.ts`)
      ]
    },
    output: {
      path: path.join(process.cwd(), 'public'),
      filename: '[name].js',
      chunkFilename: '[chunkhash].[name].js'
    },
    plugins: [
      new webpack.ContextReplacementPlugin(/\@angular(\\|\/)core(\\|\/)esm5/, path.join(process.cwd(), alias.path.client)),
      new HtmlWebpackPlugin({
        template: path.resolve(`${alias.path.client}/index.ejs`),
        chunksSortMode: function(a, b) {
          const entryPoints = ['polyfill', 'vendor', 'app'];
          return entryPoints.indexOf(a.names[0]) - entryPoints.indexOf(b.names[0]);
        },
        metadata: METADATA,
        inject: 'body' // we need set to body for ng4 - otherwise it breaks
      }),
      new HappyPack({
        id: 'ts',
        threads: 2,
        loaders: [
          {
            path: 'ts-loader',
            query: {
              happyPackMode: true
            }
          }, {
            path: 'angular2-template-loader'
          }
        ]
      }),
      new ForkTsCheckerWebpackPlugin({
        checkSyntacticErrors: true
      })
    ],
    resolveLoader: {
      modules: ['node_modules']
    },
    resolve: {
      modules: [
        'devtools',
        'client/src',
        'server',
        'e2e',
        'node_modules'
      ],
      extensions: ['.ts', '.js', '.scss', '.html'],
      alias: {
        ...alias.bootstrap,
        ...alias.module,
        ...alias.webc,
        ...alias.ui,
      }
    },
    node: {
      global: true,
      process: true,
      console: true,
      fs: 'empty'
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'html-loader'
            }
          ]
        },
        {
          test: /\.ts$/,
          exclude: [/\.(spec|e2e)\.ts$/],
          use: [
            {
              loader: 'happypack/loader?id=ts'
            }
          ]
        },
      ]
    }
  }, require('./webpack/' + _CONFIG_.environment)(_CONFIG_));
}
