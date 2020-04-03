export interface Extension {
    connect(options: {
        version: string;
    }): Connection;
}
export interface Connection {
    disconnect(): void;
    post(message: BatchMessage): PostMessage;
    subscribe(next: (message: PostMessage) => void): {
        unsubscribe(): void;
    };
    _posts: number;
    _connected: boolean;
    _listener: ((event: MessageEvent) => void) | null;
    _subscribers: ((message: PostMessage) => void)[];
}
export declare enum MessageTypes {
    CONNECT = "connect",
    NOTIFICATION = "notification",
    BROADCAST = "broadcast",
    BATCH = "batch"
}
interface PostMessageBase {
    postId: string;
    postType: string;
}
export declare type BatchMessage = {
    messageType: MessageTypes.BATCH;
    data: Message[];
};
export declare type BatchPostMessage = PostMessageBase & BatchMessage;
export declare type PostMessage = BatchPostMessage | {
    messageType: MessageTypes.CONNECT;
};
export declare type Message = {
    messageType: MessageTypes.NOTIFICATION;
    data: ObservableNotification;
};
export declare enum NotificationType {
    NEXT = "next",
    ERROR = "error",
    COMPLETE = "complete"
}
export interface ObservableNotification {
    notificationType: NotificationType;
    prefix: 'before' | 'after';
    id: string;
    tick: number;
    timestamp: number;
    observable: {
        value?: any;
        tag: string;
    };
}
export {};
//# sourceMappingURL=interfaces.d.ts.map