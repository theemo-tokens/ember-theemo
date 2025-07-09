import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import Service from '@ember/service';

import config from 'ember-get-config';

import { extractConfig } from '../utils/utils';

import type { TheemoConfig } from '../types';
import type Owner from '@ember/owner';

export default class TheemoService extends Service {
  @tracked activeTheme?: string;
  @tracked activeColorScheme?: string;

  elements: Map<string, HTMLLinkElement> = new Map();

  config: TheemoConfig;

  constructor(owner: Owner) {
    super(owner);

    this.config = extractConfig(this);

    // find loaded themes and disable all
    for (const link of document.querySelectorAll('head > link') as NodeListOf<HTMLLinkElement>) {
      if (link.dataset.theemo) {
        this.elements.set(link.dataset.theemo, link);
        link.disabled = link.dataset.theemo !== this.config.options.defaultTheme;
      }
    }

    // officially activate the default
    if (this.config.options.defaultTheme) {
      this.setTheme(this.config.options.defaultTheme);
    }
  }

  /**
   * List of available themes
   */
  get themes(): string[] {
    return Object.keys(this.config.themes);
  }

  /**
   * List of available color schemes for the active theme
   */
  get colorSchemes(): string[] {
    if (this.activeTheme) {
      return this.getColorSchemes(this.activeTheme);
    }

    return [];
  }

  getColorSchemes(name: string): string[] {
    assert(
      `Cannot find color schemes for theme '${name}': theme doesn't exist`,
      this.themes.includes(name)
    );

    return this.config.themes[name].colorSchemes;
  }

  private async loadTheme(name: string) {
    const element = await this.createLinkElement(name);

    this.elements.set(name, element);
  }

  /**
   * Set the _main_ theme at the body.
   * Method name is very likely to change
   *
   * @param name theme name
   */
  @action
  async setTheme(name: string): Promise<void> {
    if (this.activeTheme === name) {
      return;
    }

    assert(`Cannot set theme '${name}': theme doesn't exist`, this.themes.includes(name));

    // load new theme fiirst (if not done yet)
    if (!this.elements.has(name)) {
      await this.loadTheme(name);
    }

    // set new theme enabled
    const element = this.elements.get(name) as HTMLLinkElement;

    element.disabled = false;

    // disable previous theme
    if (this.activeTheme) {
      this.deactivateTheme(this.activeTheme);
    }

    // set new theme the active one
    this.activeTheme = name;
  }

  setColorScheme(name: string | undefined): void {
    if (!this.activeTheme) {
      return;
    }

    this.clearClassesForTheme(this.activeTheme);

    if (typeof name === 'string') {
      assert(
        `Cannot set color scheme '${name}': color scheme doesn't exist`,
        this.colorSchemes.includes(name)
      );

      document.body.classList.add(`${this.activeTheme}-${name}`);
    }

    this.activeColorScheme = name;
  }

  private deactivateTheme(name: string) {
    // clear classes
    this.clearClassesForTheme(name);

    // disable link
    (this.elements.get(name) as HTMLLinkElement).disabled = true;
  }

  private clearClassesForTheme(name: string) {
    for (const className of document.body.classList.values()) {
      if (className.startsWith(name)) {
        document.body.classList.remove(className);
      }
    }
  }

  private createLinkElement(theme: string): Promise<HTMLLinkElement> {
    const linkElement = document.createElement('link');

    linkElement.setAttribute('href', `${config.rootURL}theemo/${theme}.css`);
    linkElement.setAttribute('type', 'text/css');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('title', theme);
    linkElement.dataset.theemo = theme;
    document.head.append(linkElement);

    return new Promise((resolve) => {
      const listener = () => {
        linkElement.removeEventListener('load', listener);
        linkElement.disabled = true;

        resolve(linkElement);
      };

      linkElement.addEventListener('load', listener);
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    theemo: TheemoService;
  }
}
