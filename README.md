## Setup
1. Install the chrome extension
2. Set up [rxjs-spy-devtools-plugin](https://github.com/ardoq/rxjs-devtools/tree/master/packages/rxjs-spy-devtools-plugin) in your app and tag the streams that you wish to inspect in the devtools.

## Structure

This repo is split into three packages:
- **[packages/rxjs-spy-devtools-plugin](https://github.com/ardoq/rxjs-devtools/tree/master/packages/rxjs-spy-devtools-plugin)**: plugin for [rxjs-spy](https://github.com/cartant/rxjs-spy)
- **packages/extension**: chrome extension for the devtools
- **packages/shared**: shared types, interfaces and utils between all the packages

## Develop the extension
To run and develop the extension locally, inside `packages/extension`:
1. Run `yarn install` to install the dependencies.
2. Run `yarn start`
3. Load the extension in Chrome:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `packages/extension/build` folder.
4. Happy hacking!

