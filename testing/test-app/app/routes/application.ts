import Route from '@ember/routing/route';
import { type Registry as Services, service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service private declare theemo: Services['theemo'];

  beforeModel() {
    // eslint-disable-next-line no-console
    console.log('available themes:', this.theemo.themes);
  }
}
