import { MOULDER_IS_DEV, MOULDER_IS_EDITOR, MOULDER_IS_ON_FRAME } from "../constants";
import { EMoulderMode } from "../types";


export const getMode = () => {
  if (MOULDER_IS_DEV && MOULDER_IS_EDITOR) {
    return EMoulderMode.DEV;
  }
  if (MOULDER_IS_EDITOR && MOULDER_IS_ON_FRAME) {
    return EMoulderMode.EDITOR;
  }
  return EMoulderMode.PRODUCTION;
};

const is_check = (loc: string, name) => {
  return (parseInt(
    new URLSearchParams(loc).get(name) ?? '0',
    10
  ) === 1);
}

export const getAssetMode = () => {
  try {
    if (is_check(window.parent?.document.location.search, 'dev') && is_check(window.parent?.document.location.search, 'editor')) {
      return EMoulderMode.DEV;
    }
    if (is_check(window.parent?.document.location.search, 'editor') && MOULDER_IS_ON_FRAME) {
      return EMoulderMode.EDITOR;
    }
  } catch (e) {
    //
  }
  return EMoulderMode.PRODUCTION;
};
