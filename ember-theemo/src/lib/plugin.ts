/* eslint-disable no-console */
import process from 'node:process';
import { createUnplugin } from 'unplugin';

import { findRootPackage, findThemePackages, getThemeFileContents, getThemeName } from './package';

export function findRoot(meta: unknown): string {
  if (meta === 'webpack') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return meta.webpack.compiler.context;
  }

  return process.cwd();
}

export const unplugin = createUnplugin((_options: unknown, meta: unknown) => {
  const root = findRoot(meta);
  const rootPackage = findRootPackage(root);
  const themePackages = findThemePackages(rootPackage, root);

  return {
    name: 'unplugin-theemo',
    async buildStart() {
      for (const pkg of themePackages) {
        const source = getThemeFileContents(pkg, root);

        this.emitFile({
          type: 'asset',
          fileName: `/theemo/${getThemeName(pkg)}.css`,
          source
        });
      }
    }
  };
});

export const webpackPlugin = unplugin.webpack;
