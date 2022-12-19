import { assert } from '@ember/debug';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

import config from 'ember-get-config';
import theemo from 'ember-theemo/config';

export default class TheemoService extends Service {
  @tracked activeTheme?: string;
  @tracked activeColorScheme?: string;

  elements: Map<string, HTMLLinkElement> = new Map();

  constructor() {
    super();

    // find loaded themes and disable all
    for (const link of document.querySelectorAll(
      'head > link'
    ) as NodeListOf<HTMLLinkElement>) {
      if (link.dataset.theemo) {
        this.elements.set(link.dataset.theemo, link);
        link.disabled = true;
      }
    }

    // officially activate the default
    if (theemo.options.defaultTheme) {
      this.setTheme(theemo.options.defaultTheme);
    }
  }

  /**
   * List of available themes
   */
  get themes(): string[] {
    return Object.keys(theemo.themes);
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
    return theemo.themes[name].colorSchemes;
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
  async setTheme(name: string): Promise<void> {
    if (this.activeTheme === name) {
      return;
    }

    assert(
      `Cannot set theme '${name}': theme doesn't exist`,
      this.themes.includes(name)
    );

    if (!this.elements.has(name)) {
      await this.loadTheme(name);
    }

    if (this.activeTheme) {
      this.clearTheme(this.activeTheme);
    }

    const element = this.elements.get(name) as HTMLLinkElement;
    element.disabled = false;
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

  private clearTheme(name: string) {
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
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('href', `${config.rootURL}theemo/${theme}.css`);
    linkElement.dataset.theemo = theme;
    document.head.append(linkElement);

    return new Promise(resolve => {
      const listener = () => {
        linkElement.removeEventListener('load', listener);
        resolve(linkElement);
      };

      linkElement.addEventListener('load', listener);
    });
  }

  // private destroyLinkElement(node: Node) {
  //   if (node.parentNode) {
  //     node.parentNode.removeChild(node);
  //   }
  // }
}
