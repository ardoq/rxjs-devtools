import { BasePlugin } from 'rxjs-spy';
import { Spy } from 'rxjs-spy/spy-interface';
import { Observable, Subscription, Subject } from 'rxjs';
import {
  EXTENSION_KEY
} from '@shared/consts';
import {
  Connection,
  PostMessage,
  Extension,
  MessageTypes,
  ObservableNotification,
  NotificationType
} from '@shared/interfaces';
import { SubscriptionRef, SubscriberRef } from 'rxjs-spy/subscription-ref';
import { filter, bufferTime } from 'rxjs/operators';
import { read } from 'rxjs-spy/match';

let idCounter = 0;
const identify = (args?: any) => String(idCounter++);

type Options = {
  verbose?: boolean;
};

const BATCH_MILLISECONDS = 100;
const BATCH_NOTIFICATIONS = 150;
const RETRY_INIT_TIME = 500;


export default class DevToolsPlugin extends BasePlugin {
  public options: Options;
  private batchTimeoutId_: any;
  private spy_: Spy;

  // Stream of notifications that are pushed to the devtools
  private notification$: Subject<ObservableNotification>;
  private notificationSubscription: Subscription;

  // Stream of responses from the extension
  private postMessage$: Observable<PostMessage>;
  private postMessageSubscription: Subscription;

  private initRetries = 0;
  private connection: Connection | undefined;


  constructor(spy: Spy, options: Options = { verbose: false }) {
    super('devTools');
    this.options = options;
    this.spy_ = spy;
    this.notification$ = new Subject();
    this.initialize();
  }

  initialize() {
    this.log('Connecting to dev tools extension');
    if (typeof window !== 'undefined' && window[EXTENSION_KEY]) {
      const extension = window[EXTENSION_KEY] as Extension;
      this.connection = extension.connect({ version: this.spy_.version });
      this.log('Extension connected');


      this.notificationSubscription = this.notification$.pipe(
        bufferTime(BATCH_MILLISECONDS, null, BATCH_NOTIFICATIONS),
        filter(buffer => buffer.length > 0)
      ).subscribe(notifications => {
        this.log('Posting batch notification', notifications);
        this.connection.post({
          messageType: MessageTypes.BATCH,
          data: notifications.map(notification => ({
            messageType: MessageTypes.NOTIFICATION,
            data: notification
          }))
        });
      })

      this.postMessage$ = new Observable<PostMessage>(observer =>
        this.connection
          ? this.connection.subscribe(post => observer.next(post))
          : () => { }
      );

      this.postMessageSubscription = this.postMessage$
        .subscribe(message => {
          this.log('Message from extension', message);
          if (this.connection) {
            // this.connection.post(response);
          }
        });
    } else {
      this.log('Failed to connect, missing window key.');
      this.initRetries += 1;
      if (this.initRetries <= 5) {
        this.log(`Trying again in ${RETRY_INIT_TIME}ms`);
        setTimeout(() => this.initialize(), RETRY_INIT_TIME);
      } else {
        this.log('Failed to connect after 5 retries');
      }
    }
  }

  beforeNext(ref: SubscriptionRef, value: any): void {
    this.sendNotification({
      notificationType: NotificationType.NEXT,
      prefix: 'before',
      ref,
      value: serialize(value)
    });
  }

  teardown(): void {
    if (this.batchTimeoutId_ !== undefined) {
      clearTimeout(this.batchTimeoutId_);
      this.batchTimeoutId_ = undefined;
    }
    if (this.connection) {
      this.connection.disconnect();
      this.connection = undefined;
    }
    this.postMessageSubscription?.unsubscribe();
    this.notificationSubscription?.unsubscribe();
  }

  private log(...messages: any) {
    if (this.options.verbose) {
      console.log('rxjs-spy-devtools-plugin: ', ...messages);
    }
  }

  private sendNotification({ notificationType, value, ref, prefix }:
    { notificationType: NotificationType, value: any, prefix: 'before' | 'after', ref: SubscriberRef }
  ): void {
    const observable = ref.observable;
    const tag = read(observable);
    // For now skip anything that doesn't have a tag
    if (!tag) {
      return;
    }
    this.notification$.next({
      id: identify(),
      notificationType,
      prefix,
      tick: this.spy_.tick,
      timestamp: Date.now(),
      observable: {
        tag,
        value
      }
    });
  }
}

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (_: any, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

function stringifyJSONWithMaxDepth(val, replacer, depth) {
  depth = isNaN(+depth) ? 1 : depth;
  function _build(key, val, depth, o?, a?) {
    return !val || typeof val != 'object' ? val : (a = Array.isArray(val), JSON.stringify(val, function (k, v) { if (a || depth > 0) { if (replacer) v = replacer(k, v); if (!k) return (a = Array.isArray(v), val = v); !o && (o = a ? [] : {}); o[k] = _build(k, v, a ? depth : depth - 1); } }), o || (a ? [] : {}));
  }
  return JSON.stringify(_build('', val, depth), null);
}

const serialize = (obj: any) => {
  return stringifyJSONWithMaxDepth(obj, getCircularReplacer(), 5);
};