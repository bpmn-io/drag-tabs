// configures browsers to run test against
// any of [ 'ChromeHeadless', 'PhantomJS', 'Chrome', 'Firefox', 'IE' ]
var browsers =
  (process.env.TEST_BROWSERS || 'PhantomJS')
    .replace(/^\s+|\s+$/, '')
    .split(/\s*,\s*/g)
    .map(function(browser) {
      if (browser === 'ChromeHeadless') {
        process.env.CHROME_BIN = require('puppeteer').executablePath();

        // workaround https://github.com/GoogleChrome/puppeteer/issues/290
        if (process.platform === 'linux') {
          return 'ChromeHeadless_Linux';
        }
      }

      return browser;
    });

module.exports = function(karma) {
  karma.set({

    frameworks: [
      'mocha',
      'sinon-chai'
    ],

    files: [
      'test.js'
    ],

    preprocessors: {
      'test.js': [ 'webpack' ]
    },

    reporters: [ 'dots' ],

    browsers: browsers,

    customLaunchers: {
      ChromeHeadless_Linux: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ],
        debug: true
      }
    },

    singleRun: true,
    autoWatch: false,

    webpack: {
      mode: 'development'
    }
  });
};
