import {
  PANEL_BACKGROUND_CONNECT,
  PANEL_BACKGROUND_INIT,
} from '../../rxjs-spy/devtools/consts';
import { fromEventPattern, Observable } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { Post } from '../../rxjs-spy/devtools/interfaces';
import { MessageListener } from './types';

let message$: Observable<Post>;

const getMessage$ = () => {
  if (!message$) {
    const tabId = chrome.devtools.inspectedWindow.tabId;
    const _backgroundConnection = chrome.runtime.connect({
      name: PANEL_BACKGROUND_CONNECT,
    });
    _backgroundConnection.postMessage({
      postType: PANEL_BACKGROUND_INIT,
      tabId,
    });

    message$ = fromEventPattern<[Post, chrome.runtime.Port]>(
      handler =>
        _backgroundConnection.onMessage.addListener(handler as MessageListener),
      handler =>
        _backgroundConnection.onMessage.removeListener(
          handler as MessageListener
        )
    ).pipe(
      map(([post]) => post),
      share(),
      tap(message => {
        console.log('Dev panel received message', message);
      })
    );
  }
  return message$;
};

export default getMessage$;
