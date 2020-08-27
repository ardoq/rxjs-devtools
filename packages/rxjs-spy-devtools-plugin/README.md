# `rxjs-spy-devtools-plugin`

## Usage

1. Install in your project: `yarn add rxjs-spy-devtools-plugin`

2. Add the plugin to your: `rxjs-spy`

```typescript
import DevToolsPlugin from 'rxjs-spy-devtools-plugin';

const spy = create();
const devtoolsPlugin = new DevToolsPlugin(spy, {
  verbose: false,
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

## Using yarn link to test the library without publishing a new version

1. Run `yarn start`. This will continuously build the package when you make changes in `/src`.
2. Run `yarn link`. This [allows yarn to install the package via symlinks](https://yarnpkg.com/lang/en/docs/cli/link/).
3. In the root folder of the repostiory that you would like to link (i.e. ardoq-front), run `yarn link rxjs-spy-devtools-plugin`. This tells yarn to install the package from the dist folder.

Now any changes that you make in `/src` should be automatically reflected in the repository where you linked the package.
Later, you might want to use the published version of the package again. Run `yarn unlink rxjs-spy-devtools-plugin` from within the linked repo (i.e. ardoq-front).
