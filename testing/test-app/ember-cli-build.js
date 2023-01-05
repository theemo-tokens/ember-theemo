'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
// eslint-disable-next-line node/no-missing-require
const theemoPlugin = require('ember-theemo/lib/webpack');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    'ember-cli-swc-minifier': {
      enabled: true,

      exclude: ['vendor.js']
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

  const { maybeEmbroider } = require('@embroider/test-setup');

  return maybeEmbroider(app, {
    packagerOptions: {
      webpackConfig: {
        plugins: [theemoPlugin()]
      }
    }
  });
};
