import Route from '@ember/routing/route';
import { type Registry as Services, service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service declare private theemo: Services['theemo'];

  beforeModel() {
    console.log('available themes:', this.theemo.themes);
  }
}
