export interface Extension {
  connect(options: { version: string }): Connection;
}

export interface Connection {
  disconnect(): void;
  post(message: BatchMessage): PostMessage;
  subscribe(
    next: (message: PostMessage) => void
  ): {
    unsubscribe(): void;
  };
  _posts: number;
  _connected: boolean;
  _listener: ((event: MessageEvent) => void) | null;
  _subscribers: ((message: PostMessage) => void)[];
}

export enum MessageTypes {
  CONNECT = 'connect',
  NOTIFICATION = 'notification',
  BROADCAST = 'broadcast',
  BATCH = 'batch'
}

interface PostMessageBase {
  postId: string;
  postType: string;
}

export type BatchMessage = {
  messageType: MessageTypes.BATCH;
  data: Message[];
}

export type BatchPostMessage = PostMessageBase & BatchMessage;

export type PostMessage = BatchPostMessage & {
  messageType: MessageTypes.CONNECT
};

export type Message = {
  messageType: MessageTypes.NOTIFICATION;
  data: ObservableNotification;
}

export enum NotificationType {
  NEXT = 'next',
  ERROR = 'error',
  COMPLETE = 'complete'
}

export interface ObservableNotification {
  notificationType: NotificationType,
  prefix: 'before' | 'after',
  id: string,
  tick: number,
  timestamp: number,
  observable: {
    value?: any,
    tag: string
  }
}