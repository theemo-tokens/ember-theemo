import Route from '@ember/routing/route';
import * as serviceMod from '@ember/service';

import type { TheemoService } from 'ember-theemo';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const service = serviceMod.service ?? serviceMod.inject;

export default class ApplicationRoute extends Route {
  @service declare private theemo: TheemoService;

  beforeModel() {
    console.log('available themes:', this.theemo.themes);
  }
}
