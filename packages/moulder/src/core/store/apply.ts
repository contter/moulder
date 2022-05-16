import { getAssetConfig } from '../register';
import { prepareSnapshot } from './snapshot';
import { digest } from '../digest';
import { sendToParent } from '../relay/action';
import { MOULDER_ASSET_ID, MOULDER_CMD_APPLIED } from '../constants';

export const apply = (snapshot: any) => {
  // After last change
  // Call
  // - prepare state
  // - snapshot state
  // - send to parent
  // const newSnap = deepCopy(snapshot);
  const snap = prepareSnapshot(snapshot);
  const opts = getAssetConfig();
  const state = opts?.prepareState?.(snap.node) ?? snap.node;

  digest(JSON.stringify(state))
    .then((digest) => {
      const data = {
        digest,
        snap,
        state,
      };
      sendToParent({
        type: MOULDER_CMD_APPLIED,
        data,
        id: MOULDER_ASSET_ID,
      });
    })
    .catch((_) => {
      sendToParent({
        type: MOULDER_CMD_APPLIED,
        data: null,
        id: MOULDER_ASSET_ID,
      });
    });
};
