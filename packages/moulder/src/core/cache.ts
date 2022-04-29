import { deepCopy, getType } from './utils';
import { EType } from './types';

let CACHE: any = {};
let _ids: any = [];
const ids = () => _ids;

export const cleanCacheIds = () => {
  _ids = [];
};

export const getCache = () => CACHE;

export const setCache = (newCache: any) => {
  CACHE = newCache;
};

export const useCacheNode = (config: any, slug: string) => {
  let resultCache = false;
  // const slug = slugify(config?.name ?? 'Node');
  if (getType() === EType.ASSET) {
    resultCache = CACHE[slug];
    // const fromCache = CACHE[slug];
    // exist = fromCache;
    //
    // const empty = !ids().includes(slug);
    // if (fromCache && empty) {
    //   resultCache = fromCache;
    //   ids().push(slug);
    // } else if (empty && !fromCache) {
    //   CACHE[slug] = {
    //     in: config
    //   };
    // }
  }
  return {
    exist: resultCache,
    cache: resultCache,
    set: (cacheSlug: string, state: any) => {
      CACHE[cacheSlug] = deepCopy(state);
    }
  };
};

export const useCacheParameter = (node: any, config: any, slug: string) => {
  const resultCache = CACHE[slug];

  return {
    exist: resultCache,
    cache: resultCache,
    set: (cacheSlug: string, state: any) => {
      CACHE[cacheSlug] = deepCopy(state);
    },
    setOut: (cacheSlug: string, out: any) => {
      CACHE[cacheSlug].out = out;
      if (CACHE[cacheSlug].in.out !== undefined) {
        CACHE[cacheSlug].in.out = out;
      }
    },
  };
};

export const setCacheParameter = (slug: string, newState: any) => {
  const st = CACHE[slug];
  if (st) {
    st.in = { ...st.in, ...newState };
    if (newState.out !== undefined) {
      st.out = newState.out;
    }
  }
};
