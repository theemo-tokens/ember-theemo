import { setApplication } from '@ember/test-helpers';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import { setupEmberOnerrorValidation, start } from 'ember-qunit';
import { loadTests } from 'ember-qunit/test-loader';

import Application from 'test-app/app';
import config from 'test-app/config/environment';

setApplication(Application.create(config.APP));
// eslint-disable-next-line import-x/namespace
setup(QUnit.assert);
setupEmberOnerrorValidation();
loadTests();
start();
