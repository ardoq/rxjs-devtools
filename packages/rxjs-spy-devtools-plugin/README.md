# `rxjs-spy-devtools-plugin`

## Usage

1. Install in your project: `yarn add rxjs-spy-devtools-plugin`

2. Add the plugin to your: `rxjs-spy`

```typescript
import DevToolsPlugin from 'rxjs-spy-devtools-plugin';

const spy = create();
const devtoolsPlugin = new DevToolsPlugin(spy, {
  verbose: false
});
spy.plug(devtoolsPlugin);

// We must teardown the spy if we're hot-reloading:
if (module.hot) {
  if (module.hot) {
    module.hot.dispose(() => {
      spy.teardown();
    });
  }
}
```

3. [Tag the streams](https://github.com/cartant/rxjs-spy#core-concepts) that you wish to inspect in devtools.

4. Load the [chrome extension](../../README.md#installing-the-extension-in-developer-mode)


## Develop
`yarn start`

## Build
`yarn build`

## Publish new version
`yarn deploy`
