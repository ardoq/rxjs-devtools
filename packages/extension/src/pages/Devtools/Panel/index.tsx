import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { create } from 'rxjs-spy';
import startStateStreams from './startStateStreams';
import { action$ } from './action$';

console.log('Devtools panel initialized');
// Initialize spy
create();

startStateStreams(action$);

if (module.hot) {
  module.hot.accept('./startStateStreams', () => startStateStreams(action$));
  module.hot.accept('./App', () =>
    render(<App />, window.document.querySelector('#app-container'))
  );
}

render(<App />, window.document.querySelector('#app-container'));
