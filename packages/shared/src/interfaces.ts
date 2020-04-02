export interface Extension {
  connect(options: { version: string }): Connection;
}

export interface Connection {
  disconnect(): void;
  post(message: Message): Post;
  subscribe(
    next: (message: Post) => void
  ): {
    unsubscribe(): void;
  };
  _posts: number;
  _connected: boolean;
  _listener: ((event: MessageEvent) => void) | null;
  _subscribers: ((message: Post) => void)[];
}

export enum MessageTypes {
  BATCH = 'batch',
  BROADCAST = 'broadcast',
  RESPONSE = 'response',
  REQUEST = 'request'
}

export interface Message {
  messageType: MessageTypes;
  [key: string]: any;
}

export interface Post extends Message {
  [key: string]: any;
  postId: string;
  postType: string;
}