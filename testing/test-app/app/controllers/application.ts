import Controller from '@ember/controller';
import * as serviceMod from '@ember/service';

import type { TheemoService } from 'ember-theemo';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const service = serviceMod.service ?? serviceMod.inject;

export default class ApplicationController extends Controller {
  @service declare theemo: TheemoService;
}
