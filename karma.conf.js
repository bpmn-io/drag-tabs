'use strict';

module.exports = function(karma) {
  karma.set({

    frameworks: [
      'browserify',
      'mocha',
      'sinon-chai'
    ],

    files: [
      'test.js'
    ],

    preprocessors: {
      'test.js': [ 'browserify' ]
    },

    reporters: [ 'dots' ],

    browsers: [ 'PhantomJS' ],

    singleRun: true,
    autoWatch: false,

    browserify: {
      debug: true
    }
  });
};
