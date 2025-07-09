import { assert } from '@ember/debug';

import { dependencySatisfies, importSync, macroCondition } from '@embroider/macros';

import type { TheemoConfig } from '../types';
import type Application from '@ember/application';
import type { getOwner as getOwnerType } from '@ember/owner';

interface OwnerModule {
  getOwner: typeof getOwnerType;
}

const { getOwner } = (
  macroCondition(dependencySatisfies('ember-source', '>=4.10'))
    ? importSync('@ember/owner')
    : importSync('@ember/application')
) as OwnerModule;

const SCRIPT_ID = 'theemo-config';

export function extractConfig(context: unknown): TheemoConfig {
  let script = document.getElementById(SCRIPT_ID);

  if (!script) {
    // in case the app runs in shadow DOM, we need to query the script from the
    // shadow root
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const rootElement = (getOwner(context) as unknown as Application).rootElement;

    if (rootElement instanceof HTMLElement) {
      script = (rootElement.getRootNode() as HTMLElement).querySelector(`[id="${SCRIPT_ID}"]`);
    }
  }

  assert('No script tag found containing meta data for ember-theemo', script?.textContent);

  return JSON.parse(script.textContent);
}
