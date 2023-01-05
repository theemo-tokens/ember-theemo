import fs from 'node:fs';

import type { TheemoPackage } from '../types';
import type { PackageJson } from 'type-fest';

export function findRootPackage(root: string) {
  const raw = fs.readFileSync(`${root}/package.json`, { encoding: 'utf-8' });

  return JSON.parse(raw);
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
        return require(require.resolve(`${name}/package.json`, { paths: [root] }));
      } catch {
        /**/
      }
    })
    .filter(Boolean)
    .filter(isTheemoPackage)
    .filter(validateTheemoPackage);

  return packages;
}

export function getThemeName(pkg: TheemoPackage): string {
  return (pkg.theemo?.name ?? pkg.name) as string;
}

export function getThemeFile(pkg: TheemoPackage): string {
  return (pkg.theemo?.file ?? pkg.main) as string;
}

export function getThemeFilePath(pkg: TheemoPackage, root: string): string {
  return require.resolve(`${pkg.name}/${getThemeFile(pkg)}`, {
    paths: [root]
  });
}

export function getThemeFileContents(pkg: TheemoPackage, root: string): string | undefined {
  const file = getThemeFilePath(pkg, root);

  return fs.readFileSync(file, { encoding: 'utf-8' });
}
