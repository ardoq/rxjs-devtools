import { BasePlugin, inferPath, inferType } from 'rxjs-spy';
import { Spy } from 'rxjs-spy/spy-interface';
import { Observable, Subscription, BehaviorSubject, Subject } from 'rxjs';
import {
  Response,
  Notification as NotificationPayload,
  Graph as GraphPayload,
  Snapshot as SnapshotPayload,
  DeckStats as DeckStatsPayload,
} from '../../shared/src/legacyInterfaces';
import {
  Connection,
  PostMessage,
  Extension,
  Message,
  MessageTypes,
  ObservableNotification,
  NotificationType
} from '../../shared/src/interfaces';
import { SubscriptionRef, SubscriberRef } from 'rxjs-spy/subscription-ref';
import { filter, map, bufferTime } from 'rxjs/operators';
import {
  EXTENSION_KEY,
  MESSAGE_REQUEST,
  MESSAGE_RESPONSE,
  BATCH_MILLISECONDS,
  MESSAGE_BATCH,
  BATCH_NOTIFICATIONS,
  MESSAGE_BROADCAST,
} from './constants';
import { isPostRequest } from './guards';
import { read } from 'rxjs-spy/match';
import {
  getStackTrace,
  DeckStats,
  Snapshot,
  getGraphRef,
  Notification,
} from 'rxjs-spy/plugin';
import { hide } from 'rxjs-spy/operators';

// TO-DO: Remove lodash dependency
import {
  isPlainObject,
  isArray,
  isBoolean,
  isNumber,
  isString,
  isNull,
  isUndefined,
  overSome,
} from 'lodash';

interface NotificationRef {
  error?: any;
  notification: Notification;
  prefix: 'after' | 'before';
  ref: SubscriberRef;
  value?: any;
}

interface PluginRecord {
  plugin: Plugin;
  pluginId: string;
  spyId: string;
  teardown: () => void;
}

let idCounter = 0;
const identify = (args?: any) => String(idCounter++);

export default class DevToolsPlugin extends BasePlugin {
  private batchQueue_: Message[];
  private batchTimeoutId_: any;
  private connection_: Connection | undefined;
  private posts_!: Observable<PostMessage>;
  private plugins_: Map<string, PluginRecord>;
  private responses_!: Observable<Response>;
  private snapshotHinted_: boolean;
  private spy_: Spy;
  private subscription_!: Subscription;
  private notificationSubscription!: Subscription;

  // Stream of notifications that are pushed to the dev tools
  private notification$: Subject<ObservableNotification>;

  constructor(spy: Spy) {
    super('devTools');
    console.log('Setting up rxjs-spy devtools plugin');

    this.batchQueue_ = [];
    this.plugins_ = new Map<string, PluginRecord>();
    this.snapshotHinted_ = false;
    this.spy_ = spy;
    this.notification$ = new Subject();

    if (typeof window !== 'undefined' && window[EXTENSION_KEY]) {
      const extension = window[EXTENSION_KEY] as Extension;
      this.connection_ = extension.connect({ version: spy.version });
      console.log('Extension connected');


      this.notificationSubscription = this.notification$.pipe(
        bufferTime(500, null, BATCH_NOTIFICATIONS),
        filter(buffer => buffer.length > 0)
      ).subscribe(notifications => {
        console.log('Posting notifications from rxjs-spy', notifications);
        this.connection_.post({
          messageType: MessageTypes.BATCH,
          data: notifications.map(notification => ({
            messageType: MessageTypes.NOTIFICATION,
            data: notification
          }))
        });
      })

      this.posts_ = new Observable<PostMessage>(observer =>
        this.connection_
          ? this.connection_.subscribe(post => observer.next(post))
          : () => { }
      );

      // @ts-ignore
      this.responses_ = this.posts_.pipe(
        map(response => {
          console.log('Response from rxjs-spy-devtools', response);
          // return (request as unknown) as Response;
        })
      );

      this.subscription_ = this.responses_
        .pipe(hide())
        .subscribe((response: Response) => {
          if (this.connection_) {
            // this.connection_.post(response);
          }
        });
    }
  }

  // afterSubscribe(ref: SubscriptionRef): void {
  //   this.batchNotification_({
  //     notification: 'subscribe',
  //     prefix: 'after',
  //     ref,
  //   });
  // }

  // afterUnsubscribe(ref: SubscriptionRef): void {
  //   this.batchNotification_({
  //     notification: 'unsubscribe',
  //     prefix: 'after',
  //     ref,
  //   });
  // }

  // beforeComplete(ref: SubscriptionRef): void {
  //   this.batchNotification_({
  //     notification: 'complete',
  //     prefix: 'before',
  //     ref,
  //   });
  // }

  // beforeError(ref: SubscriptionRef, error: any): void {
  //   this.batchNotification_({
  //     error,
  //     notification: 'error',
  //     prefix: 'before',
  //     ref,
  //   });
  // }

  beforeNext(ref: SubscriptionRef, value: any): void {
    this.sendNotification({
      notificationType: NotificationType.NEXT,
      prefix: 'before',
      ref,
      value: serialize(value)
    });
  }

  // beforeSubscribe(ref: SubscriberRef): void {
  //   this.batchNotification_({
  //     notification: 'subscribe',
  //     prefix: 'before',
  //     ref,
  //   });
  // }

  // beforeUnsubscribe(ref: SubscriptionRef): void {
  //   this.batchNotification_({
  //     notification: 'unsubscribe',
  //     prefix: 'before',
  //     ref,
  //   });
  // }

  teardown(): void {
    if (this.batchTimeoutId_ !== undefined) {
      clearTimeout(this.batchTimeoutId_);
      this.batchTimeoutId_ = undefined;
    }
    if (this.connection_) {
      this.connection_.disconnect();
      this.connection_ = undefined;
      this.subscription_.unsubscribe();
    }
    this.notificationSubscription.unsubscribe();
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

  // private batchMessage_(message: Message): void {
  //   // If there are numerous, high-frequency observables, the connection
  //   // can become overloaded. Post the messages in batches, at a sensible
  //   // interval.

  //   if (this.batchTimeoutId_ !== undefined) {
  //     this.batchQueue_.push(message);
  //   } else {
  //     this.batchQueue_ = [message];
  //     this.batchTimeoutId_ = setTimeout(() => {
  //       const { connection_ } = this;
  //       if (connection_) {
  //         console.log(
  //           'Posting batch messages to connection',
  //           this.batchQueue_.length
  //         );
  //         connection_.post({
  //           messageType: MessageTypes.BROADCAST,
  //           messages: this.batchQueue_,
  //         });
  //         this.batchTimeoutId_ = undefined;
  //         this.batchQueue_ = [];
  //       }
  //     }, BATCH_MILLISECONDS);
  //   }
  // }

  // private batchNotification_(notificationRef: NotificationRef): void {
  //   const observable = notificationRef.ref.observable;
  //   const tag = read(observable);
  //   // For now skip anything but action$
  //   if (tag !== 'action$') {
  //     return;
  //   }
  //   const { connection_ } = this;
  //   if (connection_) {
  //     if (this.snapshotHinted_) {
  //       return;
  //     }

  //     const count = this.batchQueue_.reduce(
  //       (c, message) => (message.broadcastType === 'notification' ? c + 1 : c),
  //       0
  //     );
  //     if (count > BATCH_NOTIFICATIONS) {
  //       this.batchQueue_ = this.batchQueue_.filter(
  //         message => message.broadcastType !== 'notification'
  //       );
  //       this.batchMessage_({
  //         broadcastType: 'snapshot-hint',
  //         messageType: MessageTypes.BROADCAST,
  //       });
  //     } else {
  //       this.batchMessage_({
  //         broadcastType: 'notification',
  //         messageType: MessageTypes.BROADCAST,
  //         notification: this.toNotification_(notificationRef),
  //       });
  //     }
  //   }
  // }

  private toNotification_(
    notificationRef: NotificationRef
  ): NotificationPayload {
    const { error, notification, prefix, ref, value } = notificationRef;
    const { observable, subscriber } = ref;

    return {
      id: identify({}),
      observable: {
        id: identify(observable),
        path: inferPath(observable),
        tag: read(observable) || null,
        type: inferType(observable),
      },
      subscriber: {
        id: identify(subscriber),
      },
      subscription: {
        error,
        graph: orNull(toGraph(ref)),
        id: identify(ref),
        stackTrace: orNull(getStackTrace(ref)),
      },
      tick: this.spy_.tick,
      timestamp: Date.now(),
      type: `${prefix}-${notification}`,
      value: value === undefined ? undefined : toValue(value),
    };
  }
}

function orNull(value: any): any {
  return value === undefined ? null : value;
}

function toGraph(subscriberRef: SubscriberRef): GraphPayload | undefined {
  const graphRef = getGraphRef(subscriberRef);

  if (!graphRef) {
    return undefined;
  }

  const {
    flattenings,
    flatteningsFlushed,
    rootSink,
    sink,
    sources,
    sourcesFlushed,
  } = graphRef;
  return {
    flattenings: flattenings.map(identify),
    flatteningsFlushed,
    rootSink: rootSink ? identify(rootSink) : null,
    sink: sink ? identify(sink) : null,
    sources: sources.map(identify),
    sourcesFlushed,
  };
}

function toSnapshot(snapshot: Snapshot): SnapshotPayload {
  return {
    observables: Array.from(snapshot.observables.values()).map(s => ({
      id: s.id,
      path: s.path,
      subscriptions: Array.from(s.subscriptions.values()).map(s => s.id),
      tag: orNull(s.tag),
      tick: s.tick,
      type: s.type,
    })),
    subscribers: Array.from(snapshot.subscribers.values()).map(s => ({
      id: s.id,
      subscriptions: Array.from(s.subscriptions.values()).map(s => s.id),
      tick: s.tick,
      values: s.values.map(v => ({
        tick: v.tick,
        timestamp: v.timestamp,
        value: toValue(v.value),
      })),
      valuesFlushed: s.valuesFlushed,
    })),
    subscriptions: Array.from(snapshot.subscriptions.values()).map(s => ({
      complete: s.complete,
      error: s.error,
      graph: {
        flattenings: Array.from(s.flattenings.values()).map(s => s.id),
        flatteningsFlushed: s.flatteningsFlushed,
        rootSink: s.rootSink ? identify(s.rootSink) : null,
        sink: s.sink ? identify(s.sink) : null,
        sources: Array.from(s.sources.values()).map(s => s.id),
        sourcesFlushed: s.sourcesFlushed,
      },
      id: s.id,
      observable: identify(s.observable),
      stackTrace: s.stackTrace as any,
      subscriber: identify(s.subscriber),
      tick: s.tick,
      timestamp: s.timestamp,
      unsubscribed: s.unsubscribed,
    })),
    tick: snapshot.tick,
  };
}

function toStats(id: string, stats: DeckStats): DeckStatsPayload {
  return { id, ...stats };
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

const serialize = (obj: any) => {
  if (
    overSome([
      isPlainObject,
      isArray,
      isBoolean,
      isNumber,
      isString,
      isUndefined,
    ])(obj)
  ) {
    return JSON.stringify(obj, getCircularReplacer());
  } else {
    return JSON.stringify({
      nonSerializable: true,
    });
  }
};

function toValue(value: any): { json: string } {
  return { json: serialize(value) };
}
