chrome.devtools.panels.create(
  'RxJS Devtools',
  'rxjs-logo.png',
  'panel.html',
  function (panel) {
    // code invoked on panel creation
    console.log('Panel initialized', panel);
  }
);
