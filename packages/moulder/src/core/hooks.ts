import { postActiveNode, postSetParam } from './action';
import { slugify } from './utils';
import { setCacheParameter } from './cache';

export const useNodeClick = (node: any, evt?: MouseEvent) => {
  postActiveNode(node.toJSON());
}

export const useSetParameter = (node: any, paramName: string, data: any = {}) => {
  const paramSlug = slugify(paramName);
  const slug = Object.keys(node.state).find(a => a.startsWith(`${node.slug}__${paramSlug}`));
  if (!slug) {
    return;
  }
  node.state[slug].in = { ...node.state[slug].in, ...data };
  node.state[slug].out = data.value ?? data.out ?? node.state[slug].out;

  setCacheParameter(slug, node.state[slug]);
  postSetParam(node.toJSON(), slug);
}
