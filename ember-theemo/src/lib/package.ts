/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable unicorn/prefer-module */
import fs from 'node:fs';

import { isTheemoPackage, validateTheemoPackage } from '@theemo/theme';

import type { PackageTheme, TheemoPackage } from '@theemo/theme';
import type { PackageJson } from 'type-fest';

export interface ResolvedTheme extends PackageTheme {
  filePath?: string;
}

export type ResolvedTheemoPackage = TheemoPackage & {
  theemo?: ResolvedTheme;
};

export function findRootPackage(root: string) {
  const raw = fs.readFileSync(`${root}/package.json`, { encoding: 'utf8' });

  return JSON.parse(raw) as PackageJson;
}

export function getThemeFilePath(pkg: TheemoPackage, root: string): string {
  return require.resolve(`${pkg.name}/${pkg.theemo.file}`, {
    paths: [root]
  });
}

function loadTheme(pkg: TheemoPackage, root: string) {
  const filePath = getThemeFilePath(pkg, root);

  if (filePath) {
    const resolvedFilePath = require.resolve(filePath, { paths: [root] });

    pkg.theemo = {
      ...pkg.theemo,
      filePath: resolvedFilePath
    } as ResolvedTheme;
  }

  return pkg as ResolvedTheemoPackage;
}

export function findThemePackages(pkg: PackageJson, root: string): ResolvedTheemoPackage[] {
  const { dependencies = {}, devDependencies = {} } = pkg;

  const deps = [...Object.keys(dependencies), ...Object.keys(devDependencies)];
  const packages = deps.map((name) => {
    try {
      return require(require.resolve(`${name}/package.json`, { paths: [root] })) as PackageJson;
    } catch {
      /**/
    }

    return;
  });

  const themePackages = packages
    .filter(Boolean)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .filter((element) => isTheemoPackage(element!));

  const resolvedPackages = [];

  for (const themePkg of themePackages) {
    const validation = validateTheemoPackage(themePkg);

    if (validation.success) {
      resolvedPackages.push(loadTheme(themePkg, root));
    } else {
      console.warn(
        `[Theemo] Ignoring Theme '${themePkg.name}' due to validation errors: \n\n  - ${validation.errors.join('\n  - ')}\n`
      );
    }
  }

  return resolvedPackages;
}

export function getThemeFileContents(pkg: TheemoPackage, root: string): string | undefined {
  const file = getThemeFilePath(pkg, root);

  return fs.readFileSync(file, { encoding: 'utf8' });
}
