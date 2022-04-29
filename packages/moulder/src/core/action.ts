import { EType } from './types';
import { USE_PROXY_TARGET, USE_SET_NODE, USE_SET_PARAM, USE_SET_PARAM_STATE, USE_SWITCH_NODE } from './constants';
import { getType } from './utils';


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
      data: node
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
