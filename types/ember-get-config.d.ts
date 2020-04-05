/**
 * Type declarations for
 *    import config from 'ember-get-config'
 *
 * For now these need to be managed by the developer
 * since different ember addons can materialize new entries.
 */

declare module 'ember-get-config' {
  export interface Config {
    environment: 'production' | 'development' | 'testing';
    modulePrefix: string;
    podModulePrefix: string;
    locationType: string;
    rootURL: string;
    APP: {
      name: string;
      version: string;
    };
  }

  const config: Config;
  export default config;
}
