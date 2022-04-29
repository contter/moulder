import { tools } from './tools';
import { renderNode, renderParam } from './render';
import { postSetStateParam } from './action';
import { eventEmitter } from './event';
import { USE_SET_NODE, USE_SET_PARAM, USE_SET_PARAM_STATE, USE_SWITCH_NODE } from './constants';
import { getType, isActive } from './utils';
import { EType } from './types';

// state subs
const getSubs = (type: string) => {
  const listenToEvent = (dispatch: any, props: any) => {
    const listener = (event: any) =>
      requestAnimationFrame(() => dispatch(props.action, event.detail))

    addEventListener(props.type, listener)
    return () => removeEventListener(props.type, listener)
  }

  const listen = (type: any, action: any) => [listenToEvent, { type, action }];

  const Response = (state: any, payload: any) => ({ ...state, ...payload });

  return [listen(type, Response)] as any;
}

// USE_SET_NODE
eventEmitter.on(USE_SET_NODE, (data) => {
  renderNode(data.data, data.activeNode);
});

const stateParams: any = {};

const updStateParams = (data: any) => {
  const nodeKey = `${data.pk}_${data.nodeSlug}_${data.root}`;

  if (!stateParams[nodeKey]) {
    return
  }

  const current = stateParams[nodeKey].filter((a: any) => a.slug === data.paramSlug);
  if (current.length) {
    current[0]._config = { ...current[0]._config, ...data.state };
  }
}

// USE_SET_PARAM
eventEmitter.on(USE_SET_PARAM, (data) => {
  const { data: config, activeNode } = data;
  const { node, slug } = config;
  const _config = node.state[slug].in;
  const nodeKey = `${node.pk}_${node.slug}_${node.root}`;
  const sub_type = `t_${nodeKey}_${slug}`;
  // get tool
  const _tool = tools[_config.tool];
  // call
  let out = config.node.state[slug].out;

  if (!stateParams[nodeKey]) {
    stateParams[nodeKey] = []
  }

  const current = stateParams[nodeKey].filter((a: any) => a.slug === slug);
  if (!current.length) {
    stateParams[nodeKey].push({
      config,
      _config,
      slug,
      node,
      out,
    });
  } else {
    current[0]._config.out = out;
  }

  const subs = getSubs(sub_type);
  if (!isActive(node, activeNode)) {
    return;
  }
  const element = _tool.render({ ..._config, out }, () => subs, (state: any, newState: any) => {
    // to send data to asset
    const data = {
      pk: node.pk,
      nodeSlug: node.slug,
      paramSlug: slug,
      root: node.root,
      state: newState
    }
    postSetStateParam(data);
    updStateParams(data);

    return { ...state, ...newState };
  });
  // render in html
  renderParam(element, node, slug);
});

// USE_SWITCH_NODE
eventEmitter.on(USE_SWITCH_NODE, (data) => {
  if (getType() !== EType.PARAMS) {
    return;
  }
  const { data: { node }} = data;
  const nodeKey = `${node.pk}_${node.slug}_${node.root}`;
  const items = stateParams[nodeKey];

  items.forEach((item: any) => {

    const _tool = tools[item.config.node.state[item.config.slug].in.tool];
    const element = _tool.render({ ...item._config }, () => () => {}, (state: any, newState: any) => {
      // to send data to asset
      const data = {
        pk: node.pk,
        nodeSlug: node.slug,
        paramSlug: item.slug,
        root: node.root,
        state: newState
      }
      postSetStateParam(data);
      updStateParams(data);

      return { ...state, ...newState };
    });
    // render in html
    renderParam(element, node, item.slug);
  });
});
