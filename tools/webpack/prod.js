const webpack = require('webpack');

/**
 * Plugins
 */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (config) => {

  return {
    mode: 'production',
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'bundle.css'
      })
    ],
    module: {
      rules: [{
        test: /\.(sc|c)ss$/,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader]
      }]
    }
  }

}
