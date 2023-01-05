import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';

import type { TheemoConfig } from '../types';
import type Application from '@ember/application';

const SCRIPT_ID = 'theemo-config';

export function extractConfig(context: unknown): TheemoConfig {
  let script = document.getElementById(SCRIPT_ID);

  if (!script) {
    // in case the app runs in shadow DOM, we need to query the script from the shadow root
    const rootElement = (getOwner(context) as Application).rootElement;

    if (rootElement instanceof HTMLElement) {
      script = (rootElement.getRootNode() as HTMLElement).querySelector(`[id="${SCRIPT_ID}"]`);
    }
  }

  assert('No script tag found containing meta data for ember-theemo', script?.textContent);

  return JSON.parse(script.textContent);
}
