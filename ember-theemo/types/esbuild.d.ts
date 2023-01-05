declare module 'esbuild' {
  export type Plugin = object & {
    setup: unknown;
  };
  export type PluginBuild = object;
}
