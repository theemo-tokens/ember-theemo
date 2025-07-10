import { Addon } from '@embroider/addon-dev/rollup';

import commonjs from '@rollup/plugin-commonjs';
import { defineConfig } from 'rollup';
import multiInput from 'rollup-plugin-multi-input';
import ts from 'rollup-plugin-ts';

import { targets } from '@gossi/config-targets';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist'
});

export default defineConfig([
  {
    // This provides defaults that work well alongside `publicEntrypoints` below.
    // You can augment this if you need to.
    output: addon.output(),

    external: ['node:fs', 'node:process', 'node:crypto', 'node:crypto'],

    plugins: [
      // These are the modules that users should be able to import from your
      // addon. Anything not listed here may get optimized away.
      addon.publicEntrypoints(['**/*.ts', 'services/*.ts']),

      // These are the modules that should get reexported into the traditional
      // "app" tree. Things in here should also be in publicEntrypoints above, but
      // not everything in publicEntrypoints necessarily needs to go here.
      addon.appReexports(['services/*.{js,ts}']),

      // This babel config should *not* apply presets or compile away ES modules.
      // It exists only to provide development niceties for you, like automatic
      // template colocation.
      //
      // By default, this will load the actual babel config from the file
      // babel.config.json.
      ts({
        transpiler: 'babel',
        browserslist: targets
      }),

      // Follow the V2 Addon rules about dependencies. Your code can import from
      // `dependencies` and `peerDependencies` as well as standard Ember-provided
      // package names.
      addon.dependencies(),

      // Ensure that standalone .hbs files are properly integrated as Javascript.
      // addon.hbs(),

      // addons are allowed to contain imports of .css files, which we want rollup
      // to leave alone and keep in the published output.
      // addon.keepAssets(['**/*.css']),

      // Remove leftover build artifacts when starting a new build.
      addon.clean()
    ]
  },
  {
    input: ['./src/lib/*.ts'],
    output: {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].cjs',
      preserveModules: true
    },
    external: [
      'unplugin',
      'node:fs',
      'node:process',
      'node:crypto',
      'node:crypto',
      '@theemo/theme'
    ],
    plugins: [
      multiInput.default(), // bcz of --bundleConfigAsCjs (we get a weird import)
      ts({
        transpiler: 'babel',
        browserslist: targets
      }),
      commonjs()
    ]
  }
]);
