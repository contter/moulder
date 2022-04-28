import {
  IS_EDITOR,
  RESPONSE_PREPARE,
  RESPONSE_VIEWPORT,
  USE_PREPARE,
  USE_PROXY_TARGET,
  USE_REGENERATE,
  USE_REQUEST_CAPTURE,
  USE_RESPONSE_CAPTURE,
  USE_RUN_ASSET, USE_SET_CONF,
  USE_SET_NODE,
  USE_SET_PARAM,
  USE_SET_PARAM_STATE,
  USE_SET_RESPONSE_STATE,
  USE_SET_STATE,
  USE_SET_THEME,
  USE_SWITCH_NODE
} from './constants';
import { EType } from './types';
import { getType } from './utils';
import { useProxyNode, useProxyParameter } from './handlers';
import { setCache, setCacheParameter } from './cache';
import { captureToken } from './capture';
import { getMoulder } from './core';
import { updateConfig } from './config';

export const postDataToOnlyParent = (data: any, url: string | null = null) => {
  try {
    window.parent.postMessage(data, url ?? document.referrer);
  } catch (e) {
    //
  }
};

export const postDataToParent = (data: any, url: string | null = null, target: EType[] = []) => {
  try {
    window.parent.postMessage(
      {
        type: USE_PROXY_TARGET,
        data: {
          ...data,
          from: getType()
        },
        target,
        url: window.location.origin + window.location.pathname
      },
      url ?? document.referrer
    );
  } catch (e) {
    //
  }
};
export const postSetNode = (node: any) => {
  postDataToParent(
    {
      type: USE_SET_NODE,
      data: node.toJSON()
    },
    null,
    [EType.NODES, EType.PARAMS]
  );
};

export const postSetParam = (node: any, slug: string) => {
  postDataToParent(
    {
      type: USE_SET_PARAM,
      data: {
        node,
        slug
      }
    },
    null,
    [EType.PARAMS]
  );
};

export const postSetStateParam = (data: any) => {
  postDataToParent(
    {
      type: USE_SET_PARAM_STATE,
      data
    },
    null,
    [EType.ASSET]
  );
};

export const postActiveNode = (node: any) => {
  postDataToParent(
    {
      type: USE_SWITCH_NODE,
      data: { node }
    },
    null,
    [EType.PARAMS, EType.NODES]
  );
};

export const listenMessage = (moulder: any) => {
  window.addEventListener('message', async (event) => {
    switch (event.data?.type) {
      case USE_RUN_ASSET:
        moulder.run();
        break;

      case USE_SET_STATE:
        setCache(event.data.data.state);
        moulder.regenerate(event.data.data.hash);
        // moulder.node.fromJSON(event.data.data.state);
        postDataToOnlyParent(
          {
            type: USE_SET_RESPONSE_STATE,
            data: {
              status: 'ready',
              id: event.data.data.id
            }
          },
          event.data.url
        );
        break;

      case USE_SET_THEME:
        const doc = document.querySelector('html');
        if (doc) {
          doc.dataset.theme = event.data.data.theme;
        }
        localStorage.setItem('theme', event.data.data.theme);
        break;

      case USE_SET_PARAM_STATE:
        if (getType() !== EType.ASSET) {
          break;
        }
        // const node = searchByMulti([moulder.node], 'children', [
        //   ['pk', event.data.data.pk],
        //   ['slug', event.data.data.nodeSlug],
        //   ['root', event.data.data.root],
        // ]);
        setCacheParameter(event.data.data.paramSlug, event.data.data.state);
        break;

      case USE_SET_NODE:
        if (event.data.from !== EType.ASSET) {
          break;
        }
        if (getType() !== EType.NODES) {
          break;
        }
        useProxyNode(event.data.data);
        break;

      case USE_SET_PARAM:
        if (event.data.from !== EType.ASSET) {
          break;
        }
        if (getType() !== EType.PARAMS) {
          break;
        }
        useProxyParameter(event.data.data);
        break;

      case USE_SWITCH_NODE:
        if (getType() === EType.PARAMS || event.data.from === EType.NONE) {
          moulder.switchActiveNode(event.data.data.node, false, true);
        }
        if (getType() === EType.PARAMS || getType() === EType.NODES) {
          setTimeout(() => {
            sendViewport(event);
          }, 500);
        }
        break;

      case USE_REGENERATE:
        moulder.regenerate(event.data.data.hash);
        moulder.reload();
        if (getType() === EType.NODES || getType() === EType.PARAMS) {
          setTimeout(() => {
            sendViewport(event);
          }, 500);
        }
        break;

      case USE_PREPARE:
        // RESPONSE_PREPARE
        const data = await moulder.getData();
        postDataToOnlyParent({
          type: RESPONSE_PREPARE,
          assetId: event.data.assetId,
          requestId: event.data.requestId,
          data
        });
        break;

      case USE_RESPONSE_CAPTURE: {
        break;
      }

      case USE_SET_CONF: {
        updateConfig(event.data.data?.conf ?? {});
        break;
      }

      case USE_REQUEST_CAPTURE: {
        if (IS_EDITOR) {
          break;
        }
        captureToken(getMoulder().options)
          .then((response) => {
            postDataToOnlyParent(
              {
                type: USE_RESPONSE_CAPTURE,
                requestId: event.data.requestId,
                data: response
              });
          })
          .catch((e) => {
            //
          });
        break;
      }
    }
  });
};

const sendViewport = (event: any) => {
  postDataToOnlyParent({
    type: RESPONSE_VIEWPORT,
    assetId: event.data.assetId,
    requestId: event.data.requestId,
    data: {
      type: getType(),
      rect: JSON.parse(JSON.stringify(document.querySelector('.moulder')?.getBoundingClientRect() ?? {}))
    }
  });
}
