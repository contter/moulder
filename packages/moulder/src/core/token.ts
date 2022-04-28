/**
 * Run token with assets
 */
import { getUrl } from './utils';
import { IFRAME_ALLOW, IFRAME_SANDBOX, USE_RUN_ASSET, USE_SET_RESPONSE_STATE, USE_SET_STATE } from './constants';

export const runToken = () => {
  document.body.style.background = '#35363A';
  let counter = 0;
  const token = window.XSTATE;

  window.addEventListener('message', (event) => {
    if (event.data.type === USE_SET_RESPONSE_STATE) {
      counter += 1; // check status ?
      if (counter === token.assets.length) {
        token.assets.forEach((asset: any) => {
          const url = `${getUrl(asset.artifactUri)}&t=1`;
          asset.proxy.postMessage(
            {
              type: USE_RUN_ASSET,
              data: {}
            },
            url ?? document.location.href
          );
        });
      }
    }
  });

  const container = document.createElement('div');
  container.style.width = `${token.root.width}px`;
  container.style.height = `${token.root.height}px`;
  container.style.position = 'relative';
  token.assets.forEach((asset: any) => {
    const url = `${getUrl(asset.artifactUri)}&t=1`;
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.top = '0px';
    iframe.style.left = '0px';
    iframe.style.position = 'absolute';
    iframe.style.borderWidth = '0px';
    iframe.style.zIndex = 1 + (asset.order ?? 0);
    iframe.allow = IFRAME_ALLOW;
    IFRAME_SANDBOX.split(',').forEach((sand) => {
      iframe.sandbox.add(sand);
    });
    iframe.src = url;
    asset.iframe = iframe;

    iframe.onload = (e) => {
      const el = e.currentTarget as HTMLIFrameElement;
      asset.proxy = el.contentWindow;
      el.contentWindow?.postMessage(
        {
          type: USE_SET_STATE,
          data: {
            state: asset.state,
            id: asset.id,
            hash: asset.hash
          }
        },
        url ?? document.location.href
      );
    };
    container.append(iframe);
  });
  // USE_RUN_ASSET
  document.body.append(container);
};
