'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const theemoPlugin = require('ember-theemo/lib/webpack');

// eslint-disable-next-line unicorn/no-anonymous-default-export
module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
      // turn off the old transform
      // (for this to work when using Embroider you need https://github.com/embroider-build/embroider/pull/1673)
      disableDecoratorTransforms: true
    },

    babel: {
      plugins: [
        // add the new transform.
        require.resolve('decorator-transforms')
      ]
    },

    // Add options here
    theemo: {
      defaultTheme: 'ocean'
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
