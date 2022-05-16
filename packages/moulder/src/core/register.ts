import { IMoulder, IMoulderConfig } from './types';

let ASSET_LOAD;
let ASSET_CONFIG;

export const getLoadFunc = () => {
  return ASSET_LOAD;
};

export const getAssetConfig = (): IMoulderConfig => {
  return ASSET_CONFIG;
};

// Register asset
export const registerAsset = (
  func: (moulder: IMoulder) => void,
  config: IMoulderConfig
) => {
  ASSET_LOAD = func;
  ASSET_CONFIG = config;
};
