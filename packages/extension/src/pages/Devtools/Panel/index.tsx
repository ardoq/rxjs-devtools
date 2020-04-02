import React from 'react';
import { render } from 'react-dom';
import App from './App';

console.log('Hello from panel');
render(<App />, window.document.querySelector('#app-container'));
