// `config.js` is generated with actual config values in the build.

declare module 'ember-theemo/config' {

  export interface TheemoConfig {
    options: {
      defaultTheme?: string;
      alternates: string[];
    };
    themes: {
      [key: string]: {
        colorSchemes: string[];
      };
    };
  }

  const config: TheemoConfig;

  export default config;
}
