import { MOULDER_CMD_SET_CONF, MOULDER_IPFS_PREFIX_URL } from "./constants";
import { TConfig } from './types';
import { eventEmitter } from "./events";

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

eventEmitter.on(MOULDER_CMD_SET_CONF, data => {
  updateConfig(data.conf);
});
