# ember-theemo

Loads [theemo](https://theemo.io) themes into the ember pipeline. Watching themes for changes and
triggers page refreshs.

## Installation

```bash
ember install ember-theemo
```

## Usage

At the moment, usage is very experimental as there are surprisingly a plethora
of behaviors for your theme. As the combinations are not well experienced, the
API will mature with these experiences.

!! Note: For now `ember-theemo` assumes your themes are [generated](https://theemo.io/cli/generate) with this
configuration:

```json
{
  "auto": true,
  "defaultColorScheme": "light",
  "colorSchemes": {
    "light": {
      "auto": true,
      "manual": true
    },
    "dark": {
      "auto": true,
      "manual": true
    }
  }
}
```

And are the css file is looking similar to this:

```css
/* No color scheme related tokens */
:root, .ocean {
  --bar: baz;
}

@media (prefers-color-scheme: no-preference), (prefers-color-scheme: light) {
  :root, .ocean {
    --foo: lightblue;
  }
}

.ocean-light {
  --foo: lightblue;
}

@media (prefers-color-scheme: dark) {
  :root, .ocean {
    --foo: darkblue;
  }
}

.ocean-dark {
  --foo: darkblue;
}
```

### Configuration

In your `ember-cli-build.js` use the `theemo` property to control the build.

```js
module.exports = function(defaults) {
  let app = new EmberAddon(defaults, {
    // ...

    theemo: {
      defaultTheme: 'ocean'
    }

    // ...
  });

  return app.toTree();
};
```

Available options:

- `defaultTheme: string` - the theme loaded by default

#### Embroider

To use `ember-theemo` with embroider, you need to use the provided webpack
plugin:

```js
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const theemoPlugin = require('ember-theemo/lib/webpack');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    // ...
  });

  const { Webpack } = require('@embroider/webpack');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    packagerOptions: {
      webpackConfig: {
        plugins: [theemoPlugin()]
      }
    }
  });
};
```

### API

Use the `theemo` service to control themes:

**Important: Consider this API subject to change!**

```ts
interface TheemoService {
  @tracked activeTheme?: string;
  @tracked activeColorScheme?: string;

  /**
   * Available thems
   */
  themes: string[];

  /**
   * List of available color schemes for the active theme
   */
  colorSchemes: string[];

  /**
   * Returns a list of color schemes for a given theme
   *
   * @param name name of the theme
   */
  getColorSchemes(name: string): string[];

  /**
   * Set the active theme
   *
   * Theemo will load the theme if not already
   * available in the document.
   *
   * @param name the name of the theme
   */
  setTheme(name: string): Promise<void>;

  /**
   * Set the active color scheme
   *
   * If "none" is used, it means it will be "system"
   *
   * @param name color scheme to use or "none" to
   *   reset to "system"
   */
  setColorScheme(name: string | undefined);
}
```

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details. Please also open
issues.

## License

This project is licensed under the [MIT License](LICENSE.md).
