/* eslint-env node */

const browsers = (process.env.TEST_BROWSERS || 'ChromeHeadless').split(',');

module.exports = function(karma) {
  karma.set({

    frameworks: [
      'webpack',
      'mocha',
      'chai'
    ],

    files: [
      'test.js'
    ],

    preprocessors: {
      'test.js': [ 'webpack' ]
    },

    reporters: [ 'progress' ],

    browsers,

    singleRun: true,
    autoWatch: false,

    webpack: {
      mode: 'development'
    }
  });
};
