import {
  addMiddleware,
  applyPatch,
  applySnapshot,
  getSnapshot,
  IMiddlewareEvent,
  Instance,
  onPatch,
  types,
} from 'mobx-state-tree';
import { reaction } from 'mobx';
import { createContext, useContext } from 'react';
import { eventEmitter } from '../events';
import {
  MOULDER_CMD_APPLY,
  MOULDER_CMD_CANCEL_APPLY,
  MOULDER_CMD_CLEAR_SELECTION,
  MOULDER_CMD_PATCH_STORE,
  MOULDER_CMD_PROXY_SEND,
  MOULDER_CMD_READY,
  MOULDER_CMD_REGENERATE,
  MOULDER_CMD_REPEAT,
  MOULDER_CMD_SET_STATE,
  MOULDER_CMD_SET_THEME, MOULDER_IS_HASH
} from "../constants";
import { debounce, deepCopy, getType, searchBy } from '../utils';
import { EMoulderMode, EType } from "../types";
import { apply } from './apply';
import { regenerateRandom } from '../random';
import { Node } from './base';
import { prepareSnapshot } from './snapshot';
import { hash } from "../hash";
import { getAssetMode } from "./utils";

let IS_APPLIED_PROCESS = false;
type TypeReaction = typeof reaction;

const Store = types
  .model({
    hash: types.maybeNull(types.string),
    rnd: types.maybeNull(types.number),
    node: Node,
    mode: types.enumeration<EMoulderMode>(
      'EMoulderMode',
      Object.values(EMoulderMode)
    ),
    name: types.optional(types.string, ''),
    iteration: types.optional(types.number, 0),
    selected: types.frozen(types.array(types.string)), //types.array(types.string)//types.array(types.safeReference(Node)), // ?
  })
  .volatile<{ subscribe: (func: (reaction: TypeReaction) => void) => void }>(
    (self) => ({
      // reaction: reaction,
      subscribe: (func: (reaction: TypeReaction) => void) => {
        //,
        if (self.iteration <= 1 && self.mode !== EMoulderMode.PRODUCTION) {
          func(reaction);
        }
      },
    })
  )
  .views((self) => ({
    get selection(): Instance<typeof Node>[] {
      return self.selected?.map((a) =>
        (self as unknown as Instance<typeof Store>).findById(a)
      ) as Instance<typeof Node>[];
    },
  }))
  .actions((self) => ({
    setHash(hash: string, rnd = 0) {
      self.hash = hash;
      self.iteration += 1;
      self.rnd = rnd;
    },
    findById(id: string): Instance<typeof Node> | null {
      return searchBy([self.node], id, 'children');
    },
    setName(name: string) {
      self.name = name;
    },
    setSelection(ids) {
      self.selected = deepCopy(ids);
    },
  }));

let _hash: any = null;
let _rnd = 0;
if (MOULDER_IS_HASH) {
  _hash = hash();
  _rnd = 0.1;
}

export const store = Store.create(
  {
    hash: _hash,
    iteration: 0,
    name: '',
    rnd: _rnd,
    node: {
      id: 'root',
      name: 'Root',
      children: [],
      // children: []
    },
    mode: getAssetMode(),
    selected: [],
  },
  {}
);

let patches: any = [];

onPatch(store, (patch) => {
  let pt = deepCopy(patch);
  let idx = patches.findIndex((p) => p.op === pt.op && p.path === pt.path);
  if (idx >= 0) {
    patches = patches.splice(idx, 1);
    return;
  }
  eventEmitter.emit(MOULDER_CMD_PROXY_SEND, {
    type: MOULDER_CMD_PATCH_STORE,
    from: getType(),
    to: [EType.ASSET, EType.NODE, EType.PROPERTY].filter(
      (a) => a !== getType()
    ),
    data: {
      patch,
    },
  });
});

// From relay
eventEmitter.on(MOULDER_CMD_PATCH_STORE, (data) => {
  patches.push(deepCopy(data.data.patch));
  applyPatch(store, data.data.patch);
});

// Ready
eventEmitter.on(MOULDER_CMD_READY, (data) => {
  store.setHash(data.hash);
  store.setName(data.name);
});

if (getType() === EType.ASSET) {
  eventEmitter.on(MOULDER_CMD_REGENERATE, (data) => {
    regenerateRandom(data.hash);
    store.setHash(data.hash);
  });

  eventEmitter.on(MOULDER_CMD_REPEAT, (data) => {
    regenerateRandom(data.hash);
    store.setHash(data.hash, Math.random());
  });
}

eventEmitter.on(MOULDER_CMD_CLEAR_SELECTION, (data) => {
  store.setSelection([]);
});

eventEmitter.on(MOULDER_CMD_SET_THEME, (data) => {
  const doc = document.querySelector('html');
  if (doc) {
    doc.dataset.theme = data.theme;
  }
});

/**
 * FINAL PREPARE STATE
 */
const generateDigest = () => {
  if (IS_APPLIED_PROCESS) {
    const snapshot = getSnapshot(store);
    apply(snapshot);
  }
};

const generateDigestBounce = debounce(generateDigest, 2000);

function middlewareHandler(
  call: IMiddlewareEvent,
  next: (call: IMiddlewareEvent) => void
) {
  if (call.type === 'action' && call.parentId === 0) {
    generateDigestBounce();
  }
  return next(call);
}

if (getType() === EType.ASSET) {
  addMiddleware(store, middlewareHandler);
}

eventEmitter.on(MOULDER_CMD_APPLY, (data) => {
  // TODO Cancel apply
  IS_APPLIED_PROCESS = true;
  store.setHash(data.hash);
});

eventEmitter.on(MOULDER_CMD_CANCEL_APPLY, (_) => {
  IS_APPLIED_PROCESS = false;
});

eventEmitter.on(MOULDER_CMD_SET_STATE, (data) => {
  const snapshot = prepareSnapshot(data.snap, false);
  snapshot.iteration = 0;
  snapshot.rnd = 0.1;
  snapshot.selected = [];
  applySnapshot(store, snapshot);
});

export type TMoulderStore = Instance<typeof Store>;
const StoreContext = createContext<null | TMoulderStore>(null);

export const StoreProvider = StoreContext.Provider;
export function useStore(): TMoulderStore {
  const store = useContext(StoreContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
