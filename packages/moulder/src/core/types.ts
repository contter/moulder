declare global {
  interface Window {
    MOULDER: any;
    XSTATE: any;
    XTOKEN: any;
  }
}

// types move to
export enum EType {
  NONE = 0,
  PARAMS,
  NODES,
  ASSET
}

export interface INodeOptions {
  id?: number;
  pk?: number;
  name?: string;
}

export interface IConfig {
  type: EType;
}

export type TConfig = {
  ipfsPrefix: string;
  name?: string;
}
