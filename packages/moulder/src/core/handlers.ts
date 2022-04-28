import { tools } from './tools';
import { postSetStateParam } from './proxy';
import { renderNode, renderParam } from './render';
import { getMoulder } from './core';

export const useProxyNode = (node: any): any => {
  renderNode(node, getMoulder().activeNode);
};

const params: any = {};

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


export const useProxyParameter = (config: any = {}, render = false, fromNodes = false): any => {
  const { node, slug } = config;
  const _config = node.state[slug].in;
  const nodeKey = `${node.pk}_${node.slug}_${node.root}`;
  const sub_type = `t_${nodeKey}_${slug}`;
  // const sub_type = `t_${slug}`;

  // get helper
  const _helper = tools[_config.helper];
  // call
  let out = config.node.state[slug].out;  // _helper.call(_config);

  if (!params[nodeKey]) {
    params[nodeKey] = []
  }

  // render
  const current = params[nodeKey].filter((a: any) => a.paramSlug === slug);

  if (fromNodes && current.length) {
    out = current[0].out;
  }
  if (!fromNodes && current.length){
    current[0].out = out;
  }

  if (!render) {
    if (!current.length || !params[nodeKey].length) {
      params[nodeKey].push({
        data: config,
        paramSlug: slug,
        out,
      });
    }
    dispatchEvent(new CustomEvent(sub_type, { detail: { out } }));
  } else {
    const subs = getSubs(sub_type);
    const element = _helper.render({ ..._config, out }, () => subs, (state: any, newState: any) => {
      // to send data to asset
      postSetStateParam({
        pk: node.pk,
        nodeSlug: node.slug,
        paramSlug: slug,
        root: node.root,
        state: newState
      });

      return { ...state, ...newState };
    });
    renderParam(element, node, slug);
  }

  return out;
};

export const switchParameter = (node: any, fromNodes = false): any => {
  const nodeKey = `${node.pk}_${node.slug}_${node.root}`;
  const items = params[nodeKey];
  items?.forEach((item: any) => {
    useProxyParameter(item.data, true, fromNodes);
  });
}
