import { reaction } from 'mobx';

declare global {
  interface Window {
    MOULDER: any;
    MOULDER_TOKEN: any;
    MOULDER_STATE: any;
  }
}

export enum EType {
  NONE = 'NONE',
  PROPERTY = 'PROPERTY',
  NODE = 'NODE',
  ASSET = 'ASSET',
}

export enum EStatusWindow {
  NONE = 'NONE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export type TConfig = {
  ipfsPrefix: string;
  name?: string;
};

export interface IMoulderNodeState {
  collapse?: boolean;
  locked?: boolean;
  deleted?: boolean;
  visible?: boolean;
}

export interface IMoulderOptions {
  actions?: string[];
}

export interface IMoulderNode {
  readonly id: string;
  readonly name: string;

  readonly parent?: IMoulderNode;
  readonly children: IMoulderNode[]; // only children

  readonly state: IMoulderNodeState;
  readonly properties: IMoulderProperty[];

  readonly collapse: boolean;
  readonly locked: boolean;
  readonly visible: boolean;
  readonly options: any;

  setState: (state: IMoulderNodeState) => void;

  remove: () => void;

  createNode: (name: string, options?: IMoulderOptions) => IMoulderNode;
  useProperty: (
    component: string,
    name: string,
    state: IMoulderPropertyState,
    options?: IMoulderPropertyOpts
  ) => IMoulderProperty;
}

export interface IMoulderComponent {
  call: (state: any) => any;
  render: (state: any, setState: (state: any) => void) => any; // React.Element;
}

export interface IMoulderPropertyOpts {
  ignore?: boolean; // don't use in state digest
}

export interface IMoulderPropertyState {
  [key: string]: any;
}

export interface IMoulderNodeOptions {
  remove?: boolean;
  lock?: boolean;
  order?: boolean;
  visible?: boolean;
}

export interface IMoulderProperty {
  readonly id: string;
  readonly name: string;
  readonly component: string;
  readonly state: IMoulderPropertyState;
  readonly readState: IMoulderPropertyState;
  readonly options: IMoulderNodeOptions;
  readonly value?: any;

  change: (state: IMoulderPropertyState) => void;
}

type TypeReaction = typeof reaction;

export interface IMoulderMediaConfig {
  containerId: string;
  format: string;
  mime: string;
}

export enum EMoulderMode {
  DEV = 'DEV',
  EDITOR = 'EDITOR',
  PRODUCTION = 'PRODUCTION',
}

export interface IMoulderConfig {
  prepareState?: (node: IMoulderNode) => any;
  beforeCapture?: () => void;
  media: IMoulderMediaConfig[];
}

export interface IMoulder {
  readonly hash: string;
  readonly node: IMoulderNode;
  readonly iteration: number;
  readonly mode: EMoulderMode;

  readonly selection: string[];
  setSelection: (selection: string[]) => void;

  subscribe: (func: (reaction: TypeReaction) => void) => void;

  toJSON: () => IMoulder;
}
