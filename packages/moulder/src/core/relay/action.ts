import {
  MOULDER_ASSET_ID,
  MOULDER_CMD_PROXY_RECEIVER,
  MOULDER_CMD_PROXY_SEND,
  MOULDER_CMD_RESPONSE_CAPTURE, MOULDER_IS_EDITOR, MOULDER_IS_HASH, MOULDER_IS_ON_FRAME
} from "../constants";
import { getType } from '../utils';
import { EType } from '../types';
import { eventEmitter } from '../events';

export const sendToParent = (data) => {
  try {
    window.parent !== window &&
      window.parent.postMessage(data, document.referrer);
  } catch (e) {
    //
  }
};

eventEmitter.on(MOULDER_CMD_PROXY_SEND, (data) => {
  sendToParent({
    type: MOULDER_CMD_PROXY_SEND,
    id: MOULDER_ASSET_ID,
    data,
  });
});

eventEmitter.on(MOULDER_CMD_PROXY_RECEIVER, (data) => {
  eventEmitter.emit(data.type, data);
});

if (getType() === EType.ASSET || (MOULDER_IS_ON_FRAME && MOULDER_IS_HASH)) {
  eventEmitter.on(MOULDER_CMD_RESPONSE_CAPTURE, (data) => {
    sendToParent({
      type: MOULDER_CMD_RESPONSE_CAPTURE,
      data: data,
    });
  });
}

if (MOULDER_IS_ON_FRAME && MOULDER_IS_EDITOR) {
  eventEmitter.on(MOULDER_CMD_RESPONSE_CAPTURE, (data) => {
    sendToParent({
      type: MOULDER_CMD_RESPONSE_CAPTURE,
      data: data,
    });
  });
}
