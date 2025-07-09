import fs from 'node:fs';

import type { TheemoPackage } from '../types';
import type { PackageJson } from 'type-fest';

export function findRootPackage(root: string) {
  const raw = fs.readFileSync(`${root}/package.json`, { encoding: 'utf8' });

  return JSON.parse(raw) as PackageJson;
}

const KEYWORD = 'theemo-theme';

function isTheemoPackage(pkg: PackageJson) {
  return pkg.keywords?.includes(KEYWORD);
}

function validateTheemoPackage(pkg: TheemoPackage) {
  const { theemo } = pkg;

  if (!theemo?.file && !pkg.main) {
    console.warn(
      `Cannot find theme file in ${pkg.name}. Neither "main" nor "theemo.file" was given.`
    );

    return false;
  }

  if (!(theemo?.name || pkg.name)) {
    console.warn(
      `Cannot find a theme name in ${pkg.name}. Neither "name" nor "theemo.name" was given.`
    );
  }

  return true;
}

export function findThemePackages(pkg: PackageJson, root: string): TheemoPackage[] {
  const { dependencies = {}, devDependencies = {} } = pkg;

  const deps = [...Object.keys(dependencies), ...Object.keys(devDependencies)];

  const packages = deps
    .map((name) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module
        return require(require.resolve(`${name}/package.json`, { paths: [root] })) as PackageJson;
      } catch {
        /**/
      }

      return;
    })
    .filter(Boolean)
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    .filter((element) => isTheemoPackage(element as PackageJson))
    .filter((element) => validateTheemoPackage(element as TheemoPackage));

  return packages as TheemoPackage[];
}

export function getThemeName(pkg: TheemoPackage): string {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (pkg.theemo?.name ?? pkg.name)!;
}

export function getThemeFile(pkg: TheemoPackage): string {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (pkg.theemo?.file ?? pkg.main)!;
}

export function getThemeFilePath(pkg: TheemoPackage, root: string): string {
  // eslint-disable-next-line unicorn/prefer-module
  return require.resolve(`${pkg.name}/${getThemeFile(pkg)}`, {
    paths: [root]
  });
}

export function getThemeFileContents(pkg: TheemoPackage, root: string): string | undefined {
  const file = getThemeFilePath(pkg, root);

  return fs.readFileSync(file, { encoding: 'utf8' });
}
