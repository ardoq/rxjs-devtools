import '../../assets/img/icon-34.png';
import '../../assets/img/icon-128.png';

console.log('This is the background page.');
console.log('Put the background scripts here.');

chrome.devtools.panels.create(
  'Chrome Extension Panel',
  'icon-34.png',
  'panel.html',
  function(panel) {
    // code invoked on panel creation
    console.log(panel);
  }
);
