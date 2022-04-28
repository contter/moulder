import { EType, IConfig } from './types';
import { digest, getType } from './utils';
import { switchActive } from './render';
import { listenMessage, postActiveNode } from './proxy';
import { hash, regenerateRandom } from './hash';
import { cleanCacheIds, getCache } from './cache';
import { IS_DEV, IS_EDITOR, IS_HASH, IS_ON_FRAME, IS_STATE, IS_TYPE } from './constants';
import { runToken } from './token';
import Node from './Node';
import { runEditor } from './editor';
import { switchParameter } from "./handlers";
import { config } from './config';

// Init theme
const theme = localStorage.getItem('theme') ?? 'dark';
const doc = document.querySelector('html');
if (doc) {
  doc.dataset.theme = theme;
}

// Active node
export const getMoulder = () => window.MOULDER;

const nodeName = config().name ?? 'Node';

// Init container
const container = document.createElement('div');
container.classList.add('moulder');
document.body.append(container);

class Moulder {
  node: any;
  loadFunc: any;
  config: IConfig;
  activeNode: any = {
    pk: 0,
    root: false,
    slug: ''
  };
  hash;
  options: any = {};

  constructor(hash: string) {
    this.config = {
      type: getType()
    };
    this.hash = hash;
    this.setup();
  }

  regenerate = (hash: string) => {
    this.hash = hash;
    regenerateRandom(hash);
  };

  setup = () => {
    const doc = document.querySelector('.moulder') as HTMLElement;
    if (!doc) {
      return;
    }

    doc.addEventListener('click', (e) => {
      const el = e.target as HTMLElement;
      if (el.classList.contains('node__title')) {
        const node = {
          pk: parseInt((el.parentNode as HTMLElement).dataset.pk as string, 10),
          root: (el.parentNode as HTMLElement).dataset.root === 'true',
          slug: (el.parentNode as HTMLElement).dataset.slug
        };
        this.switchActiveNode(node as any);
      }
    });
  };

  switchActiveNode = (node: any, send = true, fromNodes = false) => {
    this.activeNode = node;
    switchActive(node);
    switchParameter(node, fromNodes);
    send && postActiveNode(this.activeNode);
  };

  setOptions = (options = {}) => {
    this.options = options;
  };

  setLoadFunc = (func: any) => {
    this.loadFunc = func;
  };

  load = () => {
    if (window.XTOKEN) {
      runToken();
      return;
    }
    if (IS_EDITOR) {
      runEditor();
      return;
    }
    if (this.config.type === EType.ASSET) {
      this.loadFunc(this.node.useNode({ name: nodeName })); // .useNode({ name: 'Node' })
    } else if (IS_HASH && IS_STATE && !IS_DEV && !IS_TYPE) {
      // wait state
    } else if (IS_HASH && !IS_DEV && !IS_TYPE) {
      this.loadFunc(this.node.useNode({ name: nodeName }));
    } else if (IS_HASH && IS_ON_FRAME && !IS_DEV && !IS_TYPE) {
      this.loadFunc(this.node.useNode({ name: nodeName }));
    }
    //   if (IS_HASH && !IS_DEV && !IS_ASSET_VIEW && !IS_PARAMS_VIEW && !IS_NODES_VIEW && !IS_ON_FRAME) {
    //     ON_LOAD();
    //   } else if (IS_HASH && IS_ON_FRAME && !IS_DEV && !IS_ASSET_VIEW && !IS_PARAMS_VIEW && !IS_NODES_VIEW ) {
    //     ON_LOAD();
    //   }
    else {
      this.node.useNode({ name: nodeName });
    }
  };

  run = () => {
    this.loadFunc(this.node.useNode({ name: nodeName }));
  };

  reload = () => {
    if (getType() === EType.NODES) {
      // const doc = document.querySelector('.moulder');
      // if (doc) {
      //   doc.innerHTML = '';
      // }
    }
    if (getType() === EType.PARAMS || getType() === EType.NODES) {
      cleanCacheIds();
      // // this.setNode(new Node());
      this.node.nodePk = 0;
      this.node.children = [];
      // this.node.useNode({ name: 'Node' });
      // if (getType() === EType.NODES) {
      //   this.switchActiveNode(this.activeNode as any)
      // }

      return;
    }
    // TODO Set as option
    const doc = document.body;
    let child = doc.lastElementChild;
    while (child) {
      doc.removeChild(child);
      child = doc.lastElementChild;
    }
    // TODO Test
    const container = document.createElement('div');
    container.classList.add('moulder');
    document.body.append(container);

    cleanCacheIds();
    // // this.setNode(new Node());
    this.node.children = [];
    this.node.nodePk = 0;
    // this.loadFunc(this.node.useNode({ name: 'Node' }))
    // this.loadFunc(this.node.children[0]);
    this.loadFunc(this.node.useNode({ name: nodeName }));
  };

  setNode = (node: any) => {
    this.node = node;
  };

  getValueState = () => {
    const valueState: any = {};
    const setState = (node: any, st: any) => {
      st[node.pk] = {};
      Object.keys(node.state).forEach((k) => {
        if (k !== 'in') {
          st[k] = node.state[k]?.out ?? node.state[k];
        }
      });
      node.children.forEach((nd: any) => {
        setState(nd, st[node.pk]);
      });
    };
    const node = this.node.toJSON();
    setState(node, valueState);
    return valueState;
  };

  getData = async () => {
    const valueState = this.getValueState();
    const digestId = await digest(JSON.stringify(valueState));
    return {
      state: getCache(),
      valueState,
      digestId,
      hash: this.hash
    };
  };
}
const moulder = new Moulder(hash());
window.MOULDER = moulder;
if (!IS_EDITOR) {
  listenMessage(moulder);
}
moulder.setNode(new Node({ name: 'Root' }));

// Register asset
export const registerAsset = (func: (node: any) => void, options = {}) => {
  moulder.setOptions(options);
  moulder.setLoadFunc(func);
  moulder.load();
};
