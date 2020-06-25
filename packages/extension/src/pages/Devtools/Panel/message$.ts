import {
  PANEL_BACKGROUND_CONNECT,
  PANEL_BACKGROUND_INIT,
} from '../../../../../shared/src/consts';
import { fromEventPattern, Observable } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { PostMessage } from '../../../../../shared/src/interfaces';
import { tag } from 'rxjs-spy/operators';

type MessageListener = (message: any) => void;

let postMessage$: Observable<PostMessage>;

const getPostMessage$ = () => {
  if (!postMessage$) {
    const tabId = chrome.devtools.inspectedWindow.tabId;
    const _backgroundConnection = chrome.runtime.connect({
      name: PANEL_BACKGROUND_CONNECT,
    });
    _backgroundConnection.postMessage({
      postType: PANEL_BACKGROUND_INIT,
      tabId,
    });

    postMessage$ = fromEventPattern<[PostMessage, chrome.runtime.Port]>(
      (handler) =>
        _backgroundConnection.onMessage.addListener(handler as MessageListener),
      (handler) =>
        _backgroundConnection.onMessage.removeListener(
          handler as MessageListener
        )
    ).pipe(
      tag('postMessage$'),
      map(([post]) => post),
      share(),
      tap((message) => {
        console.log('Dev panel received message', message);
      })
    );
  }
  return postMessage$;
};

export default getPostMessage$;
