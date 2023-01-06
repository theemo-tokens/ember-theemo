'use strict';

const path = require('path');

const { addonV1Shim } = require('@embroider/addon-shim');
const BroccoliDebug = require('broccoli-debug');
const writeFile = require('broccoli-file-creator');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');

// eslint-disable-next-line node/no-missing-require
const { createConfig } = require('ember-theemo/lib');
// eslint-disable-next-line node/no-missing-require
const { findThemePackages, getThemeFile } = require('ember-theemo/lib/package');

const addonName = require('./package').name;

const DEFAULT_OPTIONS = Object.freeze({
  /**
   * The default theme to load
   */
  defaultTheme: undefined
});

module.exports = {
  ...addonV1Shim(__dirname),

  debugTree: BroccoliDebug.buildDebugCallback(addonName),

  included(includer) {
    this._super(includer);
    this.computeOptions(includer);
  },

  computeOptions(includer) {
    if (this.theemoOptions) return;

    if (!includer.options && !this.app) {
      throw new Error('Could not find parent options.');
    }

    const parentOptions = includer.options || this.app.options;
    let options = parentOptions.theemo;

    options =
      options && typeof options === 'object'
        ? { ...DEFAULT_OPTIONS, ...options }
        : { ...DEFAULT_OPTIONS };

    this.theemoOptions = options;
  },

  contentFor(type) {
    if (type === 'body-footer') {
      const theemoPackages = findThemePackages(this.project.pkg, this.project.root);
      const config = createConfig(this.theemoOptions, theemoPackages);

      return [
        '<script id="theemo-config" type="application/json">',
        JSON.stringify(config),
        '</script>'
      ].join('\n');
    }

    if (type === 'head-footer' && this.theemoOptions.defaultTheme) {
      const rootUrl = this.project.config(process.env.EMBER_ENV).rootURL;

      return `<link
          href="${rootUrl}theemo/${this.theemoOptions.defaultTheme}.css"
          type="text/css"
          rel="stylesheet"
          title="${this.theemoOptions.defaultTheme}"
          data-theemo="${this.theemoOptions.defaultTheme}"
          data-embroider-ignore
        >`;
    }
  },

  treeForPublic(tree) {
    const originalTree = this._super(tree);

    // only run for root app
    if (this.parentAddon) return originalTree;

    const trees = [];

    if (originalTree) {
      trees.push(originalTree);
    }

    const packages = findThemePackages(this.project.pkg, this.project.root);

    trees.push(
      ...packages.map((pkg) => {
        const themeFile = getThemeFile(pkg);

        if (!themeFile) {
          throw new Error(`Package '${pkg.name}' has no 'theemo.file' in their package.json`);
        }

        const root = path.dirname(this.project.resolveSync(`${pkg.name}/package.json`));
        const directory = path.join(root, path.dirname(themeFile));
        const file = path.basename(themeFile);

        return new Funnel(directory, {
          files: [file],
          destDir: '/theemo',
          // I dunno why this next function is required :shrug:
          getDestinationPath(relativePath) {
            if (relativePath === file) {
              return `./${file}`;
            }

            return relativePath;
          }
        });
      })
    );

    return this.debugTree(mergeTrees(trees), 'treeForPublic');
  }
};
