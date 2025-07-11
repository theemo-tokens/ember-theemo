import process from 'node:process';

import { createUnplugin } from 'unplugin';

import { findRootPackage, findThemePackages, getThemeFileContents } from './package';

export function findRoot(meta: unknown): string {
  if (meta === 'webpack') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
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
    buildStart() {
      for (const pkg of themePackages) {
        const source = getThemeFileContents(pkg, root);
        const filename = pkg.theemo.name;

        // if (pkg.theemo.filePath) {
        //   const hash = await fingerprintFile(pkg.theemo.filePath);

        //   filename += `-${hash}`;
        // }

        this.emitFile({
          type: 'asset',
          fileName: `/theemo/${filename}.css`,
          source
        });
      }
    }
  };
});

export const webpackPlugin = unplugin.webpack;
