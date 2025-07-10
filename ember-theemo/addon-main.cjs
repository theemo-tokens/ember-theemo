'use strict';

const path = require('node:path');

const { addonV1Shim } = require('@embroider/addon-shim');
const BroccoliDebug = require('broccoli-debug');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');

const { createConfig } = require('ember-theemo/lib');
const { findThemePackages } = require('ember-theemo/lib/package');
const { THEEMO_CONFIG_ID } = require('@theemo/theme');

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
    if (type === 'head-footer') {
      const theemoPackages = findThemePackages(this.project.pkg, this.project.root);
      const tags = [];
      const config = createConfig(this.theemoOptions, theemoPackages);

      tags.push(`<meta name="${THEEMO_CONFIG_ID}" content="${encodeURI(JSON.stringify(config))}">`);

      const rootUrl = this.project.config(process.env.EMBER_ENV).rootURL;
      const defaultThemePkg = theemoPackages.find(
        (pkg) => pkg.theemo.name === this.theemoOptions.defaultTheme
      );

      if (defaultThemePkg) {
        let filename = defaultThemePkg.theemo.name;

        tags.push(
          `<link
            href="${rootUrl}theemo/${filename}.css"
            type="text/css"
            rel="stylesheet"
            title="${this.theemoOptions.defaultTheme}"
            data-theemo="${this.theemoOptions.defaultTheme}"
            data-embroider-ignore
          >`
        );
      }

      return tags.join('\n');
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
        const root = path.dirname(this.project.resolveSync(`${pkg.name}/package.json`));
        const directory = path.join(root, path.dirname(pkg.theemo.file));
        const file = path.basename(pkg.theemo.file);

        return new Funnel(directory, {
          files: [file],
          destDir: '/theemo',
          // I dunno why this next function is required :shrug:
          getDestinationPath(relativePath) {
            if (relativePath === file) {
              return `./${pkg.theemo.name}.css`;
            }

            return relativePath;
          }
        });
      })
    );

    return this.debugTree(mergeTrees(trees), 'treeForPublic');
  }
};
