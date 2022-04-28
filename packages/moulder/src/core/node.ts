import { EType, INodeOptions } from "./types";
import { deepCopy, getType, slugify } from "./utils";
import { useCacheNode, useCacheParameter } from "./cache";
import { tools } from "./tools";
import { postSetNode, postSetParam } from "./proxy";
import { RESERVED_WORDS } from './constants';

export default class Node {
  private pk: number = 0;
  name: string = 'Root';
  private readonly children: any[] = [];
  private parent: any;
  private slug: string = '';
  private root = false;
  private global = false;
  private nodePk = 0;
  state: any = { in: null, out: null };

  constructor(opts: INodeOptions = {}) {
    const slug = slugify(opts?.name ?? 'Node');
    this.name = opts?.name ?? 'Node';
    this.slug = slug;
    if (slug === 'root') {
      this.global = true;
    }
  }

  useParameter = (config: any = {}): any => {
    const slug = `${this.slug}__${slugify(config.title)}`;
    let _config = deepCopy(config);
    // const nodePk = this.pk;
    /**
     * - Check cache
     * - Check root (group) parameter
     * - Check index or all param group
     */

      // 1 - Check cache
    const { set, cache } = useCacheParameter(this, _config);
    if (cache) {
      _config = { ...cache.in };
    }
    // if (IS_STATE) {
    //   return cache.out;
    // }
    // TODO Fix if first run
    // TODO Use cache minMin/maxMax
    // // TODO Get from hash
    //   // TODO Check diff count nodes
    const _helper = tools[_config.helper];

    const out = _helper.call(_config);
    // if (Array.isArray(out)) {
    //   // Todo sort all. good?
    //   out = out.map(a => a.sort((a,b) => a - b)).sort((a,b) => a - b);
    // }

    const state = { in: _config, out };
    // Set global
    if (!cache) {
      set(slug, state);
    }

    this.state[slug] = state;

    // post data to params
    postSetParam(this.toJSON(), slug);
    return out;
  };

  useNode = (config: { name: string } | any) => {
    const { exist, set, cache } = useCacheNode(config);
    // Validate
    if (this.name !== 'Root' && !this.global) {
      if (RESERVED_WORDS.includes(slugify(config['name']))) {
        throw `Don't use ${RESERVED_WORDS}`;
      }
    }
    const node = new Node(config);
    // Params in base in mode and index mode
    node.pk = this.nodePk;
    node.parent = this;
    this.root = this.slug === node.slug;
    node.root = false;
    this.children.push(node);

    node.state.in = config;
    node.state.out = node.pk;
    if (!exist) {
      set(node.slug, node.state);
    }

    if (getType() === EType.ASSET && !config.skip) {
      // set data to post
      postSetNode(node);
    }

    this.nodePk += 1;
    return node;
  };

  useNodes = (config: any = {}): any[] => {
    // helper count
    // get count
    const baseNode = this.useNode({ ...config, skip: true });
    baseNode.root = true;
    if (getType() === EType.ASSET) {
      // set data to post
      postSetNode(baseNode);
    }

    const out = baseNode.useParameter(config);
    this.state.in = config;
    this.state.out = baseNode.pk;

    return new Array(out).fill(Boolean).map((_) => baseNode.useNode({ name: config.name }));
  };

  toJSON = () => {
    return {
      pk: this.pk,
      name: this.name,
      slug: this.slug,
      root: this.root,
      state: this.state,
      parent: this.parent
        ? {
          root: this.parent.root,
          pk: this.parent.pk,
          slug: this.parent.slug
        }
        : null,
      children: this.children.map((a) => a.toJSON())
    };
  };
}
