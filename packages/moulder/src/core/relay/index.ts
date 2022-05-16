import {
  MOULDER_CMD_PROXY_RECEIVER,
  MOULDER_CMD_PROXY_SEND,
  MOULDER_CMD_READY,
  MOULDER_CMD_REGENERATE,
  MOULDER_CMD_PROXY,
  MOULDER_CMD_APPLY,
  MOULDER_CMD_APPLIED,
  MOULDER_CMD_SET_THEME,
  MOULDER_CMD_REPEAT,
  MOULDER_CMD_REQUEST_CAPTURE,
  MOULDER_CMD_RESPONSE_CAPTURE,
  MOULDER_CMD_CANCEL_APPLY,
  MOULDER_CMD_CLEAR_SELECTION,
  MOULDER_CMD_SET_STATE,
} from '../constants';
import { eventEmitter } from '../events';
import './action';
import { rootStore } from '../store';

window.addEventListener('message', async (event) => {
  // if (event.data?.type?.startsWith(MOULDER_PREFIX)) {
  //   eventEmitter.emit(MOULDER_CMD_UPDATE_STATE, event.data.data);
  // }
  switch (event.data?.type) {
    case MOULDER_CMD_PROXY_RECEIVER: {
      eventEmitter.emit(MOULDER_CMD_PROXY_RECEIVER, event.data.data);
      break;
    }
    case MOULDER_CMD_SET_THEME: {
      eventEmitter.emit(MOULDER_CMD_SET_THEME, event.data.data);
      break;
    }
    case MOULDER_CMD_APPLIED: {
      eventEmitter.emit(MOULDER_CMD_APPLIED, event.data);
      break;
    }
    case MOULDER_CMD_SET_STATE: {
      eventEmitter.emit(MOULDER_CMD_SET_STATE, event.data.data);
      break;
    }
    case MOULDER_CMD_APPLY: {
      eventEmitter.emit(MOULDER_CMD_APPLY, event.data.data);
      break;
    }
    case MOULDER_CMD_CANCEL_APPLY: {
      eventEmitter.emit(MOULDER_CMD_CANCEL_APPLY, event.data.data);
      break;
    }
    case MOULDER_CMD_CLEAR_SELECTION: {
      eventEmitter.emit(MOULDER_CMD_CLEAR_SELECTION, event.data.data);
      break;
    }
    case MOULDER_CMD_REGENERATE: {
      eventEmitter.emit(event.data.type, event.data.data);
      break;
    }
    case MOULDER_CMD_REQUEST_CAPTURE: {
      // TODO Check is editor or asset
      eventEmitter.emit(MOULDER_CMD_REQUEST_CAPTURE, event.data.data);
      break;
    }
    case MOULDER_CMD_RESPONSE_CAPTURE: {
      eventEmitter.emit(MOULDER_CMD_RESPONSE_CAPTURE, event.data.data);
      // TODO Send to parent
      break;
    }
    case MOULDER_CMD_REPEAT: {
      eventEmitter.emit(event.data.type, event.data.data);
      break;
    }
    case MOULDER_CMD_PROXY_SEND: {
      const asset = rootStore.assets.find((a) => a.id === event.data.id);
      asset?.windows
        .filter((a) => event.data.data.to.includes(a.type))
        .forEach((window) => {
          window.proxy?.postMessage(
            {
              ...event.data,
              type: MOULDER_CMD_PROXY_RECEIVER,
            },
            asset.url
          ); // TODO Good with ipfs check
        });
      eventEmitter.emit(MOULDER_CMD_PROXY, event.data.data);
      break;
    }
    case MOULDER_CMD_READY: {
      eventEmitter.emit(event.data.type, event.data.data);
      break;
    }
    default: {
      break;
    }
  }
});
