import { EType, INodeOptions } from "./types";
import { deepCopy, getType, slugify } from "./utils";
import { useCacheNode, useCacheParameter } from "./cache";
import { tools } from "./tools";
import { RESERVED_WORDS } from './constants';
import { postSetNode, postSetParam } from './action';

export default class Node {
  private pk: number = 0;
  name: string = 'Root';
  private readonly children: any[] = [];
  private parent: any;
  private slug: string = '';
  private root = false;
  private global = false;
  private nodePk = 0;
  private paramPk = 0;
  state: any = { in: null, out: null };

  constructor(opts: INodeOptions = {}) {
    const slug = this.genSlug(opts?.name ?? 'Node', this.pk, this.root); //`${slugify(opts?.name ?? 'Node')}_${this.nodePk}_${this.root ? 1 : 0}`;
    this.name = opts?.name ?? 'Node';
    this.slug = slug;
    if (slug === 'root') {
      this.global = true;
    }
  }

  genSlug = (name: string, pk: number, root: boolean) => {
    return `${slugify(name)}_${pk}_${root ? 1 : 0}`;
  }

  useParameter = (config: any = {}): any => {
    const slug = `${this.slug}__${slugify(config.title)}_${this.paramPk}`;
    let _config = deepCopy(config);

    const { set, setOut, cache } = useCacheParameter(this, _config, slug);
    if (cache && config.value !== undefined && cache.value !== config.value) {
      _config.value = config.value;
      cache.in.value = config.value;
    }

    if (cache) {
      _config = { ...cache.in };
    }
    const _tool = tools[_config.tool];

    const out = _tool.call(_config);

    const state = { in: _config, out };
    // Set global
    if (!cache) {
      set(slug, state);
    } else {
      setOut(slug, out);
    }

    this.state[slug] = state;
    this.paramPk += 1;
    // post data to params
    postSetParam(this.toJSON(), slug);
    return out;
  };

  useNode = (config: { name: string } | any) => {
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
    node.root = config.root ?? false;
    this.children.push(node);

    this.slug = this.genSlug(this.name, this.pk, this.root);
    node.slug = this.genSlug(node.name, node.pk, node.root);

    const { exist, set } = useCacheNode(config, node.slug);

    node.state.in = config;
    node.state.out = node.pk;
    if (!exist) {
      set(node.slug, node.state);
    }

    this.nodePk += 1;
    if (getType() === EType.ASSET && !config.root) {
      // set data to post
      postSetNode(node.toJSON());
    }

    return node;
  };

  useNodes = (config: any = {}): any[] => {
    // _tool count
    // get count
    const baseNode = this.useNode({ ...config, root: true });
    if (getType() === EType.ASSET) {
      // set data to post
      postSetNode(baseNode.toJSON());
    }

    const out = baseNode.useParameter(config);
    this.state.in = config;
    this.state.out = baseNode.pk;

    return [new Array(out).fill(Boolean).map((_) => baseNode.useNode({ name: config.name })), baseNode];
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
