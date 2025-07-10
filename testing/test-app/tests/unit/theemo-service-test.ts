import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import type { TestContext as BaseTestContext } from '@ember/test-helpers';
import type { FeatureWithValue } from '@theemo/theme';
import type { TheemoService } from 'ember-theemo';

interface TestContext extends BaseTestContext {
  theemo: TheemoService;
}

const findFeatureByName = (features: FeatureWithValue[], name: string) => {
  return features.find((f) => f.name === name);
};

module('Unit | Service | Theemo', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    this.theemo = this.owner.lookup('service:theemo') as TheemoService;
  });

  module('Default Theme', function () {
    test('sample theme is active', function (this: TestContext, assert) {
      assert.strictEqual(this.theemo.activeTheme?.name, 'ocean');
    });

    test('link element is present', function (this: TestContext, assert) {
      const link = assert.dom('[data-theemo="ocean"]', document.documentElement);

      link.exists();
      link.hasTagName('link');
      link.hasAttribute('title', 'ocean');

      // not yet: https://github.com/mainmatter/qunit-dom/pull/1791
      // link.isNotDisabled();

      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      const linkElement = document.querySelector('[data-theemo="ocean"]') as HTMLLinkElement;

      assert.notOk(linkElement.disabled);
    });

    test('light and dark color schemes are available', function (this: TestContext, assert) {
      assert.deepEqual(findFeatureByName(this.theemo.features, 'color-scheme')?.options, [
        'light',
        'dark'
      ]);
    });
  });

  module('Theme Switching', function () {
    test('sample and ocean themes are available', function (this: TestContext, assert) {
      assert.deepEqual(
        this.theemo.themes.map((t) => t.name),
        ['ocean', 'sample']
      );
    });

    test('ocean link element is not present', function (this: TestContext, assert) {
      assert.dom('[data-theemo="sample"]', document.documentElement).doesNotExist();
    });

    test('switching to ocean theme', async function (this: TestContext, assert) {
      await this.theemo.switchTheme('sample');

      const link = assert.dom('[data-theemo="sample"]', document.documentElement);

      link.exists();
      link.hasTagName('link');
      link.hasAttribute('title', 'sample');

      // not yet: https://github.com/mainmatter/qunit-dom/pull/1791
      // link.isNotDisabled();

      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      const oceanLinkElement = document.querySelector('[data-theemo="ocean"]') as HTMLLinkElement;

      assert.ok(oceanLinkElement.disabled);

      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      const sampleLinkElement = document.querySelector('[data-theemo="sample"]') as HTMLLinkElement;

      assert.notOk(sampleLinkElement.disabled);
    });
  });
});
