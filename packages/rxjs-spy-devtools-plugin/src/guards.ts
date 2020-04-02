import {
  MESSAGE_BATCH,
  MESSAGE_BROADCAST,
  MESSAGE_REQUEST,
  MESSAGE_RESPONSE,
} from './constants';

import {
  Message,
  Post,
} from '../../shared/src/interfaces';
import {
  Batch,
  Broadcast,
  Request,
  Response,
} from '../../shared/src/legacyInterfaces';

export function isBatch(message: Message): message is Batch {
  return message.messageType === MESSAGE_BATCH;
}

export function isBroadcast(message: Message): message is Broadcast {
  return message.messageType === MESSAGE_BROADCAST;
}

export function isPost(message: Message): message is Post {
  return message.postType !== undefined;
}

export function isPostRequest(message: Message): message is Post & Request {
  return isPost(message) && message.messageType === MESSAGE_REQUEST;
}

export function isPostResponse(message: Message): message is Post & Response {
  return isPost(message) && message.messageType === MESSAGE_RESPONSE;
}

export function isRequest(message: Message): message is Request {
  return message.messageType === MESSAGE_REQUEST;
}

export function isResponse(message: Message): message is Response {
  return message.messageType === MESSAGE_RESPONSE;
}
