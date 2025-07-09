'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const theemoPlugin = require('ember-theemo/lib/webpack');

// eslint-disable-next-line unicorn/no-anonymous-default-export
module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    'ember-cli-babel': {
      enableTypeScriptTransform: true
    },

    // Add options here
    theemo: {
      defaultTheme: 'sample'
    }
  });

  /*
    This build file specifies the options for the test-app test app of this
    addon, located in `/tests/test-app`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  const { Webpack } = require('@embroider/webpack');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    packagerOptions: {
      webpackConfig: {
        plugins: [theemoPlugin()]
      }
    }
  });
};
