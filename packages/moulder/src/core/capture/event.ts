import { getType } from '../utils';
import { EType } from '../types';
import { eventEmitter } from '../events';
import {
  MOULDER_ASSET_ID,
  MOULDER_CMD_REQUEST_CAPTURE,
  MOULDER_CMD_RESPONSE_CAPTURE,
  MOULDER_IS_DEV,
  MOULDER_IS_EDITOR, MOULDER_IS_HASH, MOULDER_IS_ON_FRAME
} from "../constants";
import { capture } from './index';
import { getAssetConfig } from '../register';

if (getType() === EType.ASSET || MOULDER_IS_HASH) {
  eventEmitter.on(MOULDER_CMD_REQUEST_CAPTURE, (_) => {
    capture(getAssetConfig())
      .then((result) => {
        eventEmitter.emit(MOULDER_CMD_RESPONSE_CAPTURE, {
          id: MOULDER_ASSET_ID,
          data: result,
        });
      })
      .catch((e) => {
        //
      });
  });
}

if (MOULDER_IS_EDITOR && MOULDER_IS_DEV) {
  eventEmitter.on(MOULDER_CMD_RESPONSE_CAPTURE, (data) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(data.data.blob as Blob);
    a.setAttribute('download', `capture.${data.data.format}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}
