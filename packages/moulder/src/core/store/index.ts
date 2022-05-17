import { getParent, getSnapshot, Instance, SnapshotIn, types } from "mobx-state-tree";
import { createContext, useContext } from "react";
import { EMoulderMode, EStatusWindow, EType } from "../types";
import {
  MOULDER_CMD_ADD_ASSET,
  MOULDER_CMD_APPLIED,
  MOULDER_CMD_APPLY,
  MOULDER_CMD_CANCEL_APPLY,
  MOULDER_CMD_CLEAR_SELECTION,
  MOULDER_CMD_PROXY,
  MOULDER_CMD_READY,
  MOULDER_CMD_REGENERATE,
  MOULDER_CMD_REMOVE_ASSET,
  MOULDER_CMD_REPEAT,
  MOULDER_CMD_SET_THEME,
  MOULDER_CMD_STATUS,
  MOULDER_IS_DEV
} from "../constants";
import { generateHash, hash } from "../hash";
import { regenerateRandom } from "../random";
import { eventEmitter } from "../events";
import { sendToParent } from "../relay/action";
import { digest } from "../digest";
import { Node } from "./base";
import { getMode } from "./utils";
import { getUrl } from "../utils";

const Windows = types
  .model({
    id: types.identifierNumber,
    type: types.enumeration<EType>('EType', Object.values(EType)),
    status: types.enumeration<EStatusWindow>(
      'EStatusWindow',
      Object.values(EStatusWindow)
    ),
    // loaded: types.optional(types.boolean, false),
  })
  .volatile<{ proxy: WindowProxy | null }>((self) => ({
    proxy: null,
  }))
  .actions((self) => ({
    setProxy(proxy: WindowProxy) {
      self.proxy = proxy;
      self.status = EStatusWindow.SUCCESS;

      const ast = getParent<typeof Asset>(self, 2);
      // check all success and send ready
      if (ast.windows.filter(a => [EType.PROPERTY, EType.NODE].includes(a.type) && a.status === EStatusWindow.SUCCESS).length == 2) {
        ast.setReady(true);
      }
      if (
        ast.windows.filter((a) => a.status === EStatusWindow.SUCCESS).length ===
        ast.windows.length
      ) {
        ast.setStatus(EStatusWindow.SUCCESS);
        // TODO Check all statuses
      }
    },
  }));

const Asset = types
  .model({
    id: types.identifierNumber,
    url: types.string,
    name: types.string,
    order: types.number,
    windows: types.array(Windows),
    ready: types.optional(types.boolean, false),
    status: types.optional(
      types.enumeration<EStatusWindow>(
        'EStatusWindow',
        Object.values(EStatusWindow)
      ),
      EStatusWindow.NONE
    ),
  })
  .actions((self) => ({
    setStatus(st: EStatusWindow) {
      self.status = st;
      if (st === EStatusWindow.SUCCESS) {
        self.windows.forEach((window) => {
          window.proxy?.postMessage({
            type: MOULDER_CMD_READY,
            data: {
              name: self.name,
              hash: hash(), // TODO From state
            },
          });
        });
      }
    },
    setReady(st: boolean) {
      self.ready = st;
    }
  }));

const RootStore = types
  .model({
    applied: types.optional(types.boolean, false),
    hash: types.string,
    theme: types.string,
    assets: types.optional(types.array(Asset), []),
    selected: types.optional(types.boolean, true),

    mode: types.enumeration<EMoulderMode>(
      'EMoulderMode',
      Object.values(EMoulderMode)
    ),

    root: Node,
    scale: types.optional(types.number, 0.5),
    digest: types.maybeNull(types.string),
    state: types.optional(types.map(types.frozen()), {}), // result
  })
  .actions((self) => ({
    setState(st: any = {}, digest = '') {
      self.digest = digest;
      self.state.replace({
        data: st,
        digest,
      });
    },
    setScale(scale: number) {
      self.scale = scale;
    },
    setSelected(status: boolean) {
      self.selected = status;
      if (status) {
        self.assets.forEach((ast) => {
          ast.windows
            // .filter(a => a.type === EType.ASSET)
            .forEach((window) => {
              window.proxy?.postMessage({
                type: MOULDER_CMD_CLEAR_SELECTION,
                data: {},
              });
            });
        });
      }
    },
    setTheme(theme: string) {
      self.theme = theme;
      try {
        localStorage.setItem('theme', theme);
      } catch {
        //
      }
      self.assets.forEach((a) => {
        a.windows.forEach((window) => {
          window.proxy?.postMessage(
            {
              type: MOULDER_CMD_SET_THEME,
              data: { theme },
            },
            getUrl(a.url)
          );
        });
      });
      // TODO Send to children asset
    },
    addAsset(asset: SnapshotIn<typeof Asset> | Instance<typeof Asset>) {
      self.assets.push(asset);
    },
    removeAsset(assetId) {
      const asset = self.assets.find(a => a.id === assetId);
      if (asset) {
        self.assets.remove(asset);
      }
    },
    apply() {
      // const newHash = generateHash();
      self.applied = true;
      // self.hash = newHash;
      regenerateRandom(self.hash);
      self.assets.forEach((ast) => {
        ast.windows
          .filter((a) => a.type === EType.ASSET)
          .forEach((window) => {
            window.proxy?.postMessage({
              type: MOULDER_CMD_APPLY,
              data: {
                hash: self.hash,
              },
            });
          });
      });
    },
    unsetApplied() {
      self.state.replace({});
      self.applied = false;
      self.digest = null;
      sendToParent({
        type: MOULDER_CMD_STATUS,
        data: {
          status: 'busy',
        },
      });
      self.assets.forEach((ast) => {
        ast.windows
          .filter((a) => a.type === EType.ASSET)
          .forEach((window) => {
            window.proxy?.postMessage({
              type: MOULDER_CMD_CANCEL_APPLY,
              data: {},
            });
          });
      });
    },
    generate() {
      const newHash = generateHash();
      regenerateRandom(newHash);
      self.hash = newHash;
      self.assets.forEach((ast) => {
        ast.windows
          .filter((a) => a.type === EType.ASSET)
          .forEach((window) => {
            window.proxy?.postMessage({
              type: MOULDER_CMD_REGENERATE,
              data: {
                hash: newHash,
              },
            });
          });
      });
    },
    repeat() {
      self.assets.forEach((ast) => {
        ast.windows
          .filter((a) => a.type === EType.ASSET)
          .forEach((window) => {
            window.proxy?.postMessage({
              type: MOULDER_CMD_REPEAT,
              data: {
                hash: self.hash,
              },
            });
          });
      });
    },
  }));

const getTheme = () => {
  try {
    return localStorage.getItem('theme') ?? 'dark';
  } catch {
    return 'dark';
  }
};

export const rootStore = RootStore.create(
  {
    theme: getTheme(),
    hash: hash(),
    mode: getMode(),
    root: {
      id: 'root',
      name: 'Root',
      children: [],
    },
  },
  {}
);

// onSnapshot(rootStore, (snapshot) => {
//   // console.log("Snapshot: ", snapshot);
//   // localStorage.setItem("rootState", JSON.stringify(snapshot));
// });

// // On Any command
eventEmitter.on(MOULDER_CMD_APPLIED, (data) => {
  if (!data.data) {
    rootStore.unsetApplied();
    alert('Error. Report an error.');
    return;
  }
  // TODO In future support many asset
  const handleState = {};
  rootStore.assets.forEach((a) => {
    handleState[a.id] = {
      id: a.id,
      order: a.order,
      state: data.data.state, // only prepare State
    };
  });
  const assets = rootStore.assets.map((a) => {
    return {
      id: a.id,
      url: a.url,
      order: a.order,
      state: data.data,
    };
  });
  const state = {
    assets,
    root: rootStore.root.toJSON(),
    hash: rootStore.hash,
  };
  digest(JSON.stringify(handleState))
    .then((digest) => {
      if (rootStore.applied) {
        rootStore.setState(state, digest);
        sendToParent({
          type: MOULDER_CMD_STATUS,
          data: {
            status: 'ready',
            // state,
            snapshot: getSnapshot(rootStore),
          },
        });
        if (MOULDER_IS_DEV) {
          navigator.clipboard
            .writeText(JSON.stringify(rootStore.state.toJSON()))
            .then(
              function () {
                console.log('State to clipboard was successful!');
              },
              function (err) {
                console.error('Async: Could not copy state: ', err);
              }
            );
        }
      }
    })
    .catch((_) => {
      rootStore.unsetApplied();
    });
});

eventEmitter.on(MOULDER_CMD_PROXY, (data) => {
  if (
    data.data?.patch?.path?.includes('selected') &&
    data.data?.patch?.value?.length
  ) {
    rootStore.setSelected(false);
  }
});

eventEmitter.on(MOULDER_CMD_ADD_ASSET, data => {
  // console.log('-e-MOULDER_CMD_ADD_ASSET', data);
  rootStore.addAsset({
    ...data.asset,
    windows: [
      {
        id: 1,
        type: EType.ASSET,
        status: EStatusWindow.LOADING,
      },
      {
        id: 2,
        type: EType.NODE,
        status: EStatusWindow.LOADING,
      },
      {
        id: 3,
        type: EType.PROPERTY,
        status: EStatusWindow.LOADING,
      },
    ],
  });
});

eventEmitter.on(MOULDER_CMD_REMOVE_ASSET, data => {
  rootStore.removeAsset(data.assetId);
});

export type RootInstance = Instance<typeof RootStore>;
const RootStoreContext = createContext<null | RootInstance>(null);

export const Provider = RootStoreContext.Provider;
export function useRootStore(): RootInstance {
  const store = useContext(RootStoreContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
