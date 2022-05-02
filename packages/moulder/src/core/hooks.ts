import { postActiveNode } from './action';

export const useNodeClick = (node: any, evt?: MouseEvent) => {
  postActiveNode(node.toJSON());
}
