import {
  MOULDER_CMD_SET_STATE,
  MOULDER_CONFIG_DEFAULT_SIZE,
  MOULDER_CONTAINER_ID,
  MOULDER_IFRAME_ALLOW,
  MOULDER_IFRAME_SANDBOX,
} from '../constants';
import { getUrl } from '../utils';
import { EMoulderMode } from "../types";

export const runToken = () => {
  const doc = document.querySelector(`#${MOULDER_CONTAINER_ID}`);
  if (doc) {
    doc.remove();
  }
  const state = window.MOULDER_STATE;
  const width =
    state.data.root.properties.find((a) => a.id === 'size')?.state?.width
      ?.value ?? MOULDER_CONFIG_DEFAULT_SIZE;
  const height =
    state.data.root.properties.find((a) => a.id === 'size')?.state?.height
      ?.value ?? MOULDER_CONFIG_DEFAULT_SIZE;
  // const digest = state.digest;
  const hash = state.data.hash;
  const assets = state.data.assets;

  const container = document.createElement('div');
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.position = 'relative';

  // Render assets
  assets.forEach((asset) => {
    const url = `${getUrl(asset.url)}?hash=${hash}`;
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.top = '0px';
    iframe.style.left = '0px';
    iframe.style.position = 'absolute';
    iframe.style.borderWidth = '0px';
    iframe.style.zIndex = 1 + (asset.order ?? 0);
    iframe.allow = MOULDER_IFRAME_ALLOW;
    MOULDER_IFRAME_SANDBOX.split(' ').forEach((sand) => {
      iframe.sandbox.add(sand);
    });
    iframe.src = url;
    asset.iframe = iframe;

    iframe.onload = (e) => {
      const el = e.currentTarget as HTMLIFrameElement;
      asset.proxy = el.contentWindow;
      asset.state.snap.mode = EMoulderMode.PRODUCTION;
      el.contentWindow?.postMessage(
        {
          type: MOULDER_CMD_SET_STATE,
          data: {
            snap: asset.state.snap,
          },
        },
        url ?? document.location.href
      );
    };
    container.append(iframe);
  });

  document.body.append(container);
};
