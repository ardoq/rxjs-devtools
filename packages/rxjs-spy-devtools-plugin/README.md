# `rxjs-spy-devtools-plugin`

## Usage

1. Install in your project:
`yarn add rxjs-spy-devtools-plugin`

2. Add the plugin to your spy

```typescript
import DevToolsPlugin from 'rxjs-spy-devtools-plugin';

const spy = create();
const devtoolsPlugin = new DevToolsPlugin(spy, {
  verbose: false
});
spy.plug(devtoolsPlugin);

if (module.hot) {
  if (module.hot) {
    module.hot.dispose(() => {
      spy.teardown();
    });
  }
}
```
