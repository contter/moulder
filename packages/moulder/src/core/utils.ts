import { EType } from './types';
import { config } from './config';

export const getType = (): EType => {
  return new URLSearchParams(window.location.search).get('type') as EType;
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

export const deepCopy = (data) => JSON.parse(JSON.stringify(data));

export const id = (): string => {
  const a = new Uint32Array(3);
  window.crypto.getRandomValues(a);
  return (
    performance.now().toString(36) +
    Array.from(a)
      .map((A) => A.toString(36))
      .join('')
  ).replace(/\./g, '');
};

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
export const hexToRgb = (c: string) =>
  `rgb(${c.match(/\w\w/g)?.map((x) => +`0x${x}`)})`;

export const rgbToHex = (c: string) =>
  // @ts-ignore
  '#' + c.match(/\d+/g).map((x) => (+x).toString(16).padStart(2, '0')).join``;

export const groupBy = <T, K extends keyof any>(
  list: T[],
  getKey: (item: T) => K
) =>
  list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) previous[group] = [];
    previous[group].push(currentItem);
    return previous;
  }, {} as Record<K, T[]>);

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
    isImmediate: false,
  }
): DebouncedFunction<F> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debouncedFunction = function (
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ) {
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

export function recursiveRename(obj, key1 = '', key2 = '') {
  if (obj && obj[key1]) {
    const tempObj = deepCopy(obj[key1]);
    delete obj[key1];
    obj[key2] = tempObj;
  }
  if (obj[key2] && obj[key2].length) {
    obj[key2].forEach((child) => {
      recursiveRename(child, key1, key2);
    });
  }
}

export const searchBy = (
  arr: any,
  itemId: number | string,
  key: string,
  id = 'id'
) => {
  return arr.reduce((a: any, item: any) => {
    if (a) return a;
    if (item[id] === itemId) return item;
    if (item[key]) return searchBy(item[key], itemId, key, id);
    return null;
  }, null);
};
// @ts-ignore
export const range = (start: number, end: number) => {
  return [...Array(end - start + 1)].map((_, i) => start + i);
};
