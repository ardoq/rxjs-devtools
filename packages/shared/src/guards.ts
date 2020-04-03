import {
  MESSAGE_BATCH,
} from './consts';

import {
  PostMessage,
  BatchPostMessage,
} from './interfaces';

export function isBatch(message: PostMessage): message is BatchPostMessage {
  return message.messageType === MESSAGE_BATCH;
}