import { BasePlugin } from 'rxjs-spy';
import { Observable, Subscription, Subject } from 'rxjs';
import { EXTENSION_KEY } from '@shared/consts';
import {
  Connection,
  PostMessage,
  Extension,
  MessageTypes,
  ObservableNotification,
  NotificationType,
} from '@shared/interfaces';
import { filter, bufferTime } from 'rxjs/operators';
import serialize, { SerializeReplacer } from './serialize';
import { Spy } from 'rxjs-spy/cjs/spy-interface';
import { SubscriptionRef, SubscriberRef } from 'rxjs-spy/cjs/subscription-ref';
import { read } from 'rxjs-spy/cjs/match';

let idCounter = 0;
const identify = () => String(idCounter++);

type Options = {
  verbose?: boolean;
  serializeReplacer?: SerializeReplacer;
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

      this.notificationSubscription = this.notification$
        .pipe(
          bufferTime(BATCH_MILLISECONDS, null, BATCH_NOTIFICATIONS),
          filter((buffer) => buffer.length > 0)
        )
        .subscribe((notifications) => {
          this.log('Posting batch notification', notifications);
          this.connection.post({
            messageType: MessageTypes.BATCH,
            data: notifications.map((notification) => ({
              messageType: MessageTypes.NOTIFICATION,
              data: notification,
            })),
          });
        });

      this.postMessage$ = new Observable<PostMessage>((observer) =>
        this.connection
          ? this.connection.subscribe((post: any) => observer.next(post))
          : () => undefined
      );

      this.postMessageSubscription = this.postMessage$.subscribe((message) => {
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
      value: serialize(value, this.options.serializeReplacer),
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

  private sendNotification({
    notificationType,
    value,
    ref,
    prefix,
  }: {
    notificationType: NotificationType;
    value: any;
    prefix: 'before' | 'after';
    ref: SubscriberRef;
  }): void {
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
        value,
      },
    });
  }
}
