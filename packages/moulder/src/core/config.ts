import { MOULDER_IPFS_PREFIX_URL } from './constants';
import { TConfig } from './types';

let defaultConfig: TConfig = {
  ipfsPrefix: MOULDER_IPFS_PREFIX_URL,
};

export const config = (): TConfig => {
  return defaultConfig;
};

export const updateConfig = (conf: Partial<TConfig>): void => {
  // Validation ?
  defaultConfig = { ...defaultConfig, ...conf };
};
