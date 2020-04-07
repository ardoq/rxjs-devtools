import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { create } from 'rxjs-spy';

console.log('Devtools panel initialized');
const spy = create();

render(<App />, window.document.querySelector('#app-container'));
