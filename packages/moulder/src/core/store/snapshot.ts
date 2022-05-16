import { deepCopy, recursiveRename } from '../utils';

export const prepareSnapshot = (snap: any, toState = true) => {
  const newSnap = deepCopy(snap);
  if (toState) {
    // replace childrenLocal to children
    recursiveRename(newSnap.node, 'childrenLocal', 'children');
  } else {
    // replace children to childrenLocal
    recursiveRename(newSnap.node, 'children', 'childrenLocal');
  }

  return newSnap;
};
