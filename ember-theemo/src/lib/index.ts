import { getThemeName } from './package';

import type {
  TheemoConfig,
  TheemoDescriptor,
  TheemoOptions,
  TheemoPackage,
  ThemeFeatures
} from '../types';

export function createConfig(options: TheemoOptions, packages: TheemoPackage[]): TheemoConfig {
  const themes: Record<string, ThemeFeatures> = {};

  for (const pkg of packages) {
    const theemo: TheemoDescriptor = pkg.theemo || {};
    const name = getThemeName(pkg);
    const features: ThemeFeatures = {
      colorSchemes: theemo.colorSchemes || []
    };

    themes[name] = features;
  }

  return {
    options,
    themes
  };
}
