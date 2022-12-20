'use strict';

const path = require('path');

const { addonV1Shim } = require('@embroider/addon-shim');
const BroccoliDebug = require('broccoli-debug');
const writeFile = require('broccoli-file-creator');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');

const addonName = require('./package').name;

const DEFAULT_OPTIONS = Object.freeze({
  /**
   * The default theme to load
   */
  default: undefined
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
    if (type !== 'head-footer') {
      return;
    }

    const rootUrl = this.project.config(process.env.EMBER_ENV).rootURL;

    if (this.theemoOptions.defaultTheme) {
      return `<link
        href="${rootUrl}theemo/${this.theemoOptions.defaultTheme}.css"
        rel="stylesheet"
        title="${this.theemoOptions.defaultTheme}"
        data-theemo="${this.theemoOptions.defaultTheme}"
      >`;
    }
  },

  findThemePackages() {
    const keyword = 'theemo-theme';
    const { dependencies = {}, devDependencies = {} } = this.project.pkg;

    const deps = [...Object.keys(dependencies), ...Object.keys(devDependencies)];

    const packages = deps
      .map((name) => this.project.require(`${name}/package.json`))
      .filter((json) => json.keywords && json.keywords.includes(keyword))
      .map((json) => ({
        name: (json.theemo && json.theemo.name) || json.name,
        package: json
      }));

    // if (packages.length === 0) {
    //   // throw new Error(
    //   //   `Could not find a package with the '${keyword}' keyword.`
    //   // );
    // }
    // return packages;

    return packages;
  },

  treeForAddon(tree) {
    const originalTree = this._super.treeForAddon.apply(this, tree);

    // Only run for the root app.
    if (this.parentAddon) return originalTree;

    const packages = this.findThemePackages();

    const themes = {};

    for (const theme of packages) {
      const theemo = theme.package.theemo || {};

      themes[theme.name] = {
        colorSchemes: theemo.colorSchemes || []
      };
    }

    const configModuleName = `${this.name}/config`;
    const config = {
      options: this.theemoOptions,
      themes
    };

    const configFile = writeFile(
      `${configModuleName}.js`,
      `define.exports('${configModuleName}', ${JSON.stringify(config)});`
    );

    const mergedTree = this.debugTree(
      mergeTrees(
        [originalTree, configFile].filter((tree) => tree !== undefined),
        {
          annotation: 'ember-theemo:merge-config'
        }
      ),
      'treeForAddon'
    );

    return mergedTree;
  },

  treeForPublic(tree) {
    const originalTree = this._super(tree);

    // only run for root app
    if (this.parentAddon) return originalTree;

    const trees = [];

    if (originalTree) {
      trees.push(originalTree);
    }

    const packages = this.findThemePackages();

    trees.push(
      ...packages.map((theme) => {
        if (!theme.package.theemo.file) {
          throw new Error(
            `Package '${theme.package.name}' has no 'theemo.file' in their package.json`
          );
        }

        const root = path.dirname(this.project.resolveSync(`${theme.package.name}/package.json`));
        const directory = path.join(root, path.dirname(theme.package.theemo.file));
        const file = path.basename(theme.package.theemo.file);

        return new Funnel(directory, {
          files: [file],
          destDir: '/theemo',
          // I dunno why this next function is required :shrug:
          getDestinationPath(relativePath) {
            if (relativePath === file) {
              return `./${theme.name}.css`;
            }

            return relativePath;
          }
        });
      })
    );

    return this.debugTree(mergeTrees(trees), 'treeForPublic');
  }
};
