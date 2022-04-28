import { getType, slugify } from './utils';
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

const cache = () => {
  // if (getType() === EType.ASSET) {
  //   const fromCache = CACHE[slug];
  //
  //   if (fromCache && !getter.includes(slug)) {
  //     getter.push(slug);
  //   } else {
  //     CACHE[slug] = this;
  //   }
  // }
};

export const useCacheNode = (config: any) => {
  let exist = false;
  let resultCache;
  const slug = slugify(config?.name ?? 'Node');
  if (getType() === EType.ASSET) {
    const fromCache = CACHE[slug];
    exist = fromCache;

    const empty = !ids().includes(slug);
    if (fromCache && empty) {
      resultCache = fromCache;
      ids().push(slug);
    } else if (empty && !fromCache) {
      CACHE[slug] = {
        in: config
      };
    }
  }
  return {
    exist,
    cache: resultCache,
    set: (cacheSlug: string, state: any) => {
      CACHE[cacheSlug] = JSON.parse(JSON.stringify(state));
    }
  };
};

export const useCacheParameter = (node: any, config: any) => {
  const nodeSlug = slugify(node.name ?? 'Node');
  const slug = `${nodeSlug}__${slugify(config?.title ?? 'Parameter')}`;

  const resultCache = CACHE[slug];

  return {
    exist: resultCache,
    cache: resultCache,
    set: (cacheSlug: string, state: any) => {
      CACHE[cacheSlug] = JSON.parse(JSON.stringify(state));
    },
    setIn: (cacheSlug: string, newState: any) => {
      const st = CACHE[cacheSlug];
      if (st) {
        st.in = { ...st.in, ...newState };
      }
      // new state, only config
    }
  };
};

export const setCacheParameter = (slug: string, newState: any) => {
  const st = CACHE[slug];
  if (st) {
    st.in = { ...st.in, ...newState };
  }
};
