import Controller from '@ember/controller';
import { type Registry as Services, service } from '@ember/service';

export default class ApplicationController extends Controller {
  @service declare theemo: Services['theemo'];
}
