import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { create } from 'rxjs-spy';
import DevToolsPlugin from 'rxjs-spy-devtools-plugin/dist';

console.log('Devtools panel initialized');
const spy = create();
const devtoolsPlugin = new DevToolsPlugin(spy);
spy.plug(devtoolsPlugin);

if (module.hot) {
  if (module.hot) {
    module.hot.dispose(() => {
      spy.teardown();
    });
  }
}


render(<App />, window.document.querySelector('#app-container'));
