import '../../assets/img/icon-34.png';
import '../../assets/img/icon-128.png';
/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/rxjs-spy-devtools
 */

import {
  CONTENT_BACKGROUND_CONNECT,
  CONTENT_MESSAGE,
  PANEL_BACKGROUND_CONNECT,
  PANEL_BACKGROUND_INIT,
  PANEL_MESSAGE,
} from '../rxjs-spy/devtools/consts';

import { fromEventPattern } from 'rxjs';
import {
  filter,
  finalize,
  map,
  mergeMap,
  share,
  takeUntil,
  tap,
} from 'rxjs/operators';

type Message = any;
type MessageListener = (message: Message) => void;
type Port = chrome.runtime.Port;
type PortListener = (port: chrome.runtime.Port) => void;
type TabId = any;

const connections: {
  [key: string]: {
    contentPort: Port | null;
    panelPort: Port | null;
  };
} = {};

console.log('Background script initialized');

const ports = fromEventPattern<Port>(
  handler => chrome.runtime.onConnect.addListener(handler as PortListener),
  handler => chrome.runtime.onConnect.removeListener(handler as PortListener)
).pipe(share());

const messages = (port: Port, teardown: () => void) =>
  fromEventPattern<[Message, Port]>(
    handler => port.onMessage.addListener(handler as MessageListener),
    handler => port.onMessage.removeListener(handler as MessageListener)
  ).pipe(
    map(([message]) => message),
    finalize(teardown),
    takeUntil(
      fromEventPattern(
        handler => port.onDisconnect.addListener(handler as PortListener),
        handler => port.onDisconnect.removeListener(handler as PortListener)
      )
    ),
    share()
  );

console.log('Subscribing to panel messages');
const panelMessages = ports.pipe(
  filter(port => port.name === PANEL_BACKGROUND_CONNECT),
  mergeMap(
    port =>
      messages(port, () => {
        const key = Object.keys(connections).find(
          key => connections[key].panelPort === port
        );
        if (key) {
          connections[key].panelPort = null;
        }
      }),
    (port, message) => ({ key: message.tabId, port, message })
  ),
  filter(({ key }) => Boolean(key))
);

panelMessages
  .pipe(filter(({ message }) => message.postType === PANEL_BACKGROUND_INIT))
  .subscribe(({ key, port, message }) => {
    const connection = connections[key];
    console.log('panel init', message);
    if (connection) {
      connection.panelPort = port;
    } else {
      connections[key] = { contentPort: null, panelPort: port };
    }
  });

panelMessages
  .pipe(filter(({ message }) => message.postType !== PANEL_BACKGROUND_INIT))
  .subscribe(({ key, port, message }) => {
    const connection = connections[key];
    if (!connection) {
      console.warn('No connection');
    } else if (message.postType === PANEL_MESSAGE) {
      console.log('Message from panel', message);
      if (connection && connection.contentPort) {
        connection.contentPort.postMessage(message);
      }
    } else {
      console.warn('Unexpected panel message', message);
    }
  });

const contentMessages = ports.pipe(
  filter(
    port =>
      port &&
      port.sender &&
      port.sender.tab &&
      port.name === CONTENT_BACKGROUND_CONNECT
  ),
  map(port => ({ key: port.sender.tab.id, port })),
  tap(({ key, port }) => {
    const connection = connections[key];
    console.log('Connection to injected content script initialized');
    if (connection) {
      connection.contentPort = port;
    } else {
      connections[key] = { contentPort: port, panelPort: null };
    }
  }),
  mergeMap(
    ({ key, port }) =>
      messages(port, () => {
        connections[key].contentPort = null;
      }),
    ({ key, port }, message) => ({ key, port, message })
  )
);

contentMessages.subscribe(({ key, port, message }) => {
  const connection = connections[key];
  if (!connection) {
    console.warn('No connection');
  } else if (message.postType === CONTENT_MESSAGE) {
    console.log('Message from injected content script', message);
    console.log('Forwarding message to panel?', Boolean(connection.panelPort));
    if (connection.panelPort) {
      connection.panelPort.postMessage(message);
    }
  } else {
    console.warn('Unexpected content message', message);
  }
});
