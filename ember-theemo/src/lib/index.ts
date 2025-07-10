import type { PluginOptions } from './config';
import type { ResolvedTheemoPackage } from './package';
import type { TheemoRuntimeConfig } from '@theemo/theme';

export function createConfig(
  options: PluginOptions & { fingerprint?: boolean },
  packages: ResolvedTheemoPackage[]
): TheemoRuntimeConfig {
  const themes = packages.map((pkg) => pkg.theemo);

  return {
    options,
    themes: themes.map((t) => {
      const filename = t.name;

      return {
        name: t.name,
        features: t.features,
        filename
      };
    })
  };
}
