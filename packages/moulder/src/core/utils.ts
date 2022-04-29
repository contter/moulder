import { EType } from './types';
import { config } from './config';

export const digest = async (message: string): Promise<string> => {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const searchBy = (arr: any, itemId: number | string, key: string, id = 'id') => {
  return arr.reduce((a: any, item: any) => {
    if (a) return a;
    if (item[id] === itemId) return item;
    if (item[key]) return searchBy(item[key], itemId, key, id);
  }, null);
};

export const searchByMulti = (arr: any, childrenKey: string, m: any = [['id', 0]]) => {
  return arr.reduce((a: any, item: any) => {
    if (a) return a;
    // if (item[id] === itemId) return item;
    if (m.every((c: any) => c[1] === item[c[0]])) return item;
    if (item[childrenKey]) return searchByMulti(item[childrenKey], childrenKey, m);
  }, null);
};

export function useState<S>(initialState: S): { value: S; set: (state: S) => void } {
  const st = {
    value: initialState,
    set: (state: any) => {
      /**/
    }
  };
  st.set = (state) => {
    st.value = { ...st.value, ...state };
  }; // TODO Callback, on (emit)
  return st;
}

export const slugify = (...args: (string | number)[]): string => {
  const value = args.join(' ');

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, '-');
};
// @ts-ignore
export const hexToRgb = (c: string) => `rgb(${c.match(/\w\w/g).map((x) => +`0x${x}`)})`;
// @ts-ignore
export const rgbToHex = (c: string) => '#' + c.match(/\d+/g).map((x) => (+x).toString(16).padStart(2, '0')).join``;

export const getType = (): EType => {
  let type = EType.NONE;
  switch (new URLSearchParams(window.location.search).get('type')) {
    case '1':
      type = EType.PARAMS;
      break;
    case '2':
      type = EType.NODES;
      break;
    case '3':
      type = EType.ASSET;
      break;
  }
  return type;
};

const ipfsToUrl = (ipfs: string) => {
  const preIpfs = ipfs.slice(7);
  return `${config().ipfsPrefix}${preIpfs}`;
};

export const getUrl = (url: string) => {
  if (url.startsWith('ipfs://')) {
    url = ipfsToUrl(url);
  }
  return url;
};

export const deepCopy = (data: any) => JSON.parse(JSON.stringify(data));

export type Procedure = (...args: any[]) => void;

export type Options = {
  isImmediate: boolean;
};

export interface DebouncedFunction<F extends Procedure> {
  (this: ThisParameterType<F>, ...args: Parameters<F>): void;
  cancel: () => void;
}

export function debounce<F extends Procedure>(
  func: F,
  waitMilliseconds = 50,
  options: Options = {
    isImmediate: false
  }
): DebouncedFunction<F> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debouncedFunction = function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;

    const doLater = function () {
      timeoutId = undefined;
      if (!options.isImmediate) {
        func.apply(context, args);
      }
    };

    const shouldCallNow = options.isImmediate && timeoutId === undefined;

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(doLater, waitMilliseconds);

    if (shouldCallNow) {
      func.apply(context, args);
    }
  };

  debouncedFunction.cancel = function () {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  };

  return debouncedFunction;
}

export const isActive = (node: any, activeNode: any) => {
  return node.slug === activeNode.slug && node.pk === activeNode.pk && node.root === activeNode.root;
};

