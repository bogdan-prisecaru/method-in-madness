module.exports = function (config) {
  config.set({
    basePath: '',
     frameworks: ['jasmine'],
     port: 9876,
     colors: true,
     files: [{
       pattern: './karma.shim.js'
     }],
     reporters: [
       'spec'
     ],
     preprocessors: {
       './karma.shim.js': ['webpack']
     },
     webpack: WebpackConfig({
       environment: 'test'
     }),
     webpackServer: {
       noInfo: true
     },
     browsers: ['Chrome'],
     singleRun: true
  });
});
