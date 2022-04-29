
import { h, app } from 'hyperapp';
import {
  IFRAME_ALLOW,
  IS_CHECK,
  IS_DEV,
  IS_EDITOR,
  IS_ON_FRAME,
  RESPONSE_PREPARE, RESPONSE_VIEWPORT,
  TEMPLATE_FORMATS,
  THEMES,
  USE_ADD_ASSET, USE_PING,
  USE_PREPARE,
  USE_PROXY_TARGET,
  USE_REGENERATE,
  USE_REMOVE_ASSET,
  USE_REQUEST_CAPTURE,
  USE_RESPONSE_CAPTURE, USE_SET_CONF,
  USE_SET_NODE,
  USE_SET_PARAM, USE_SET_PARAM_STATE,
  USE_SET_THEME,
  USE_SWITCH_NODE
} from './constants';
import { generateHash, hash, random } from "./hash";
import { inputComponent, tabComponent } from "./tools";
import { debounce, digest, getUrl } from "./utils";
import { EType } from "./types";
import { updateConfig } from './config';

const DEFAULT_WIDTH = 1000;
const DEFAULT_HEIGHT = 1000;
const DEFAULT_PADDING = 100;

const renderIframe = (url: string, onload: (s: any, e: any) => void, onerror: (s: any, e: any) => void): any => {
  return h('iframe', {
    // id: 'iframe',
    // class: 'iframe',
    style: {
      height: '100%'
    },
    allow: IFRAME_ALLOW,
    src: url,
    width: '100%',
    height: '100%',
    sandbox: 'allow-same-origin allow-scripts',
    onload: (s, e) => onload(s, e),
    onerror: (s, e) => onerror(s, e),
  })
}

const loader = (): any => {
  return h('div', { class: 'w-full h-full relative flex justify-center items-center' }, [
    h('svg', {
      style: {
        width: '24px',
        height: '24px',
      },
      class: 'animate-spin h-5 w-5 text-white',
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewbox: '0 0 24 24'
    }, [
      h('circle', { class: 'opacity-25', cx: '12', cy: '12', r: '10', stroke: 'currentColor', 'stroke-width': '4' }),
      h('path', { class: 'opacity-75', fill: 'currentColor', d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' })
    ])
  ]);
}

const listenToEvent = (dispatch: any, props: any) => {
  const listener = (event: any) =>
    requestAnimationFrame(() => dispatch(props.action, event.detail))

  addEventListener(props.type, listener)
  return () => removeEventListener(props.type, listener)
}

const listen = (type: any, action: any) => [listenToEvent, { type, action }];

const Response = (state: any, payload: any) => ({ ...state, ...payload })

export const runEditor = () => {
  const initHash = hash();
  let proxy: any = {};
  let store: any = {
    root: {
      sizeMode: 'cstm',
      tmplIdx: 0,
      width: {
        name: 'Width',
        value: 1000,
        unit: 'px',
        min: 800,
        max: 1200,
        minW: 800,
        maxW: 1200,
        minMin: 100,
        maxMax: 4000,
        step: 0,
        mode: 'cstm'
        // minMin: 100,
        // maxMax: 4000
      },
      height: {
        name: 'Height',
        value: 1000,
        unit: 'px',
        min: 800,
        max: 1200,
        minH: 800,
        maxH: 1200,
        minMin: 100,
        maxMax: 4000,
        step: 0,
        mode: 'cstm'
        // minMin: 100,
        // maxMax: 4000
      }
    },
    assets: [],
    rect: {},
    paramElement: {},
    nodeElement: {},
    assetElement: {},
    hash: '',
    digest: '',
    scale: 1,
    changed: false,
    configured: !IS_ON_FRAME,
    activeAssetId: -1,
    payload: null,
    theme: localStorage.getItem('theme') ?? 'dark'
  };

  const setStore = (s: any): any => {
    store = s;
    return s;
  }

  if (IS_DEV) {
    // TODO Set local
    store.assets.push({
      state: {},
      asset: {
        id: 1,
        name: 'Node',
        metadata: {
          name: 'Node',
          artifactUri: window.location.origin + window.location.pathname
        },
      },
      order: 0,
    })
    proxy = { ...proxy, 1: { node: null, asset: null, param: null, } };
    store.paramElement = { 1: { rect: null, status: 'loading', rnd: '' }};
    store.nodeElement = { 1: { rect: null, status: 'loading', rnd: '' }};
    store.assetElement = { 1: { rect: null, status: 'loading', rnd: '' }};
  }

  const getScale = (width = null, height = null) => {
    const designWidth = width ?? store.root.width?.value ?? DEFAULT_WIDTH;
    const designHeight = height ?? store.root.height?.value ?? DEFAULT_HEIGHT;
    const header = document.getElementById('header')?.getBoundingClientRect();
    const footer = document.getElementById('footer')?.getBoundingClientRect();
    const left = document.getElementById('left')?.getBoundingClientRect();
    const right = document.getElementById('right')?.getBoundingClientRect();
    const container = document.getElementById('container')?.getBoundingClientRect();
    let scale = 1;
    // Calculate viewport and good scaling
    if (header && left && right && container && footer) {
      const width = container.width - right.width - left.width;
      const height = container.height - header.height - footer.height;
      const minSize = Math.min(width, height);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const maxSize = Math.max(designWidth, designHeight);
      scale = minSize / (maxSize + DEFAULT_PADDING);
      // store.getScale(scale);
      store.scale = scale;
      // dispatchEvent(new CustomEvent('store', { detail: setStore({ ...store, scale }) }));
    }
    return scale;
  }

  const setDigest = (requestId?: string) => {
    store.assets.forEach((a: any) => {
      proxy[a.asset.id]?.['asset']?.postMessage(
        {
          type: USE_PREPARE,
          requestId: requestId ?? '0',
          assetId: a.asset?.id
        },
        getUrl(a.asset.metadata.artifactUri)
      );
    });
  };

  const setDigestBounce = debounce(setDigest, 2000);

  const capture = (s: any) => {
    s.assets.forEach((a: any) => {
      proxy[a.asset.id]?.['asset']?.postMessage({ type: USE_REQUEST_CAPTURE, requestId: generateHash() }, getUrl(a.asset.metadata.artifactUri));
    });
  }

  const generate = (s: any) => {
    // setActiveAssetId(-1);

    // state.digest = '';
    // // state.hash = hash();
    // // New size if random set
    let scale = store.scale ?? 1;
    if (s.root.sizeMode === 'rnd') {
      const width = random().betweenInt(s.root.width.minW, s.root.width.maxW);
      const height = random().betweenInt(s.root.height.minH, s.root.height.maxH);
      s.root.width.value = width;
      s.root.height.value = height;
      // @ts-ignore
      scale = getScale(width, height);
      dispatchEvent(new CustomEvent('store', { detail: setStore({
        ...store,
        scale,
        root: {
          ...s.root,
          width: { ...s.root.width, value: width },
          height: { ...s.root.height, value: height }
        }
      })}));
      //{ ...state, root: { ...state.root, width: { ...state.root.width, value: val }}}
    } else if (s.root.sizeMode === 'tmpl') {
      // state.root.state.size.extend.width.value = width;
      // state.root.state.size.extend.height.value = height;
    } else {
      scale = getScale();
    }
    const _hash = generateHash();

    setTimeout(() => {
      store.assets.forEach((a: any) => {
        proxy[a.asset.id]?.['param']?.postMessage({ type: USE_REGENERATE, data: { hash: _hash } }, getUrl(a.asset.metadata.artifactUri));
        proxy[a.asset.id]?.['node']?.postMessage({ type: USE_REGENERATE, data: { hash: _hash } }, getUrl(a.asset.metadata.artifactUri));
        proxy[a.asset.id]?.['asset']?.postMessage({ type: USE_REGENERATE, data: { hash: _hash } }, getUrl(a.asset.metadata.artifactUri));
      });
    }, 500);
    return setStore({ ...s, hash: _hash, scale, digest: '', changed: false });
  }

  const repeat = (s: any) => {
    store.assets.forEach((a: any) => {
      proxy[a.asset.id]?.['param']?.postMessage({ type: USE_REGENERATE, data: { hash: s.hash } }, getUrl(a.asset.metadata.artifactUri));
      proxy[a.asset.id]?.['node']?.postMessage({ type: USE_REGENERATE, data: { hash: s.hash } }, getUrl(a.asset.metadata.artifactUri));
      proxy[a.asset.id]?.['asset']?.postMessage({ type: USE_REGENERATE, data: { hash: s.hash } }, getUrl(a.asset.metadata.artifactUri));
    });
    return s;
  }

  const setActiveAssetId = (assetId: any, send = true) => {
    if (send) {
      const data = {
        type: USE_SWITCH_NODE,
        from: 0,
        data: {
          node: {
            pk: -1,
            root: false,
            slug: '#'
          }
        }
      };
      store.assets.forEach((a: any) => {
        proxy[a.asset.id]?.['param']?.postMessage(data, getUrl(a.asset.metadata.artifactUri));
        proxy[a.asset.id]?.['node']?.postMessage(data, getUrl(a.asset.metadata.artifactUri));
        proxy[a.asset.id]?.['asset']?.postMessage(data, getUrl(a.asset.metadata.artifactUri));
      });
    }
    dispatchEvent(new CustomEvent('store', { detail: setStore({ ...store, activeAssetId: assetId }) }));
  }

  const container = document.createElement('div');
  document.body.append(container);

  window.addEventListener(
    'message',
    async (event) => {
      // new
      switch (event.data?.type) {
        case RESPONSE_VIEWPORT: {
          const asset = store.assets.find((a: any) => a && getUrl(a.asset.metadata.artifactUri)?.includes(event.origin));
          if (asset) {
            let dt;
            if (event.data.data.type === EType.NODES) {
              dt = {
                ...store,
                nodeElement: {
                  ...store.nodeElement,
                  [asset.asset.id]: { ...store.nodeElement[asset.asset.id], rect: event.data.data.rect }
                }
              }
            }
            if (event.data.data.type === EType.PARAMS) {
              dt = {
                ...store,
                paramElement: {
                  ...store.paramElement,
                  [asset.asset.id]: { ...store.paramElement[asset.asset.id], rect: event.data.data.rect }
                }
              }
            }

            if (dt) {
              dispatchEvent(new CustomEvent('store', {
                detail: setStore(dt),
              }));
            }
          }
          break;
        }

        case USE_SET_CONF: {
          updateConfig(event.data.data?.conf ?? {});

          let target = event.data.data?.target ?? []
          if (event.data.data?.target === 'all') {
            target = store.assets.map((a: any) => a.asset.id);
          }

          target.forEach((id: any) => {
            const a = store.assets.find((a: any) => a.asset.id === id);
            if (a) {
              proxy[a.asset.id]?.['param']?.postMessage(event.data, getUrl(a.asset.metadata.artifactUri));
              proxy[a.asset.id]?.['node']?.postMessage(event.data, getUrl(a.asset.metadata.artifactUri));
              proxy[a.asset.id]?.['asset']?.postMessage(event.data, getUrl(a.asset.metadata.artifactUri));
            }
          });

          dispatchEvent(new CustomEvent('store', { detail: setStore({ ...store, configured: true })}));
          break;
        }

        case USE_RESPONSE_CAPTURE: {
          // TODO WAIT ALL
          if (IS_ON_FRAME) {
            window.parent?.window?.postMessage(
              event.data,
              document.referrer
            );
          }
          break;
        }

        case USE_REQUEST_CAPTURE: {
          // TODO WAIT ALL
          store.assets.forEach((a: any) => {
            proxy[a.asset.id]?.['asset']?.postMessage(event.data, getUrl(a.asset.metadata.artifactUri));
          });
          break;
        }

        case USE_PROXY_TARGET: {
          const asset = store.assets.find((a: any) => a && getUrl(a.asset.metadata.artifactUri)?.includes(event.origin));
          if (!asset) {
            break;
          }
          if (event.data.data.type === USE_SET_PARAM_STATE) {
            dispatchEvent(new CustomEvent('store', { detail: setStore({ ...store, changed: true }) }));
          }
          (event.data.target as EType[]).map((target) => {
            if (target === EType.ASSET) {
              proxy[asset.asset.id]?.['asset']?.postMessage(event.data.data, event.origin);
            }
            if (target === EType.NODES) {
              proxy[asset.asset.id]?.['node']?.postMessage(event.data.data, event.origin);
            }
            if (target === EType.PARAMS) {
              proxy[asset.asset.id]?.['param']?.postMessage(event.data.data, event.origin);
            }
          });
          if ([USE_SET_NODE, USE_SET_PARAM].includes(event.data.data.type)) {
            setDigestBounce();
          }
          if (event.data.data.type === USE_SWITCH_NODE) {
            const assetId = store.assets.find((a: any) => a && getUrl(a.asset.metadata.artifactUri)?.includes(event.origin))?.asset?.id ?? -1;
            setActiveAssetId(assetId, false);
          }
          break;
        }

        case RESPONSE_PREPARE: {
          // // TODO WAIT ALL
          const responseValue = store.assets.map((a: any) => {
            return {
              id: a.asset?.id,
              order: a.order,
              data: {
                digest: event.data.data.digest,
                hash: event.data.data.hash,
                valueState: event.data.data.valueState
              }
            };
          });
          const responseState = store.assets.map((a: any) => {
            return {
              id: a.asset?.id,
              order: a.order,
              data: {
                digest: event.data.data.digest,
                hash: event.data.data.hash,
                state: event.data.data.state
              }
            };
          });

          // TODO Check sort good
          const valueState = {
            assets: responseValue,
            // root: {
            //   width: store.root.width.value,
            //   height: store.root.height.value
            // }
          };
          const digestId = await digest(JSON.stringify(valueState));
          try {
            if (IS_EDITOR && IS_ON_FRAME) {
              // TODO Check cycle
              window.parent?.window?.postMessage(
                {
                  type: event.data.type,
                  requestId: event.data.requestId,
                  data: {
                    state: {
                      assets: responseState,
                      root: {
                        width: store.root.width.value,
                        height: store.root.height.value
                      }
                    },
                    valueState,
                    digest: digestId
                  }
                },
                document.referrer
              );
            }
          } catch (e) {
            //
          }

          dispatchEvent(new CustomEvent('store', { detail: setStore({ ...store, digest: digestId }) }));
          break;
        }

        case USE_PREPARE: {
          // Get store and digest and hashes from assets;
          // TODO WAIT ALL
          if (IS_EDITOR && IS_ON_FRAME) {
            setDigest(event.data.requestId);
          }
          break;
        }

        case USE_ADD_ASSET: {
          // Add Asset
          const assets = store.assets;
          assets.push({
            asset: event.data.data,
            order: event.data.order ?? 0,
          });
          proxy[event.data.data.id] = {
            param: null,
            node: null,
            asset: null,
          };

          dispatchEvent(new CustomEvent('store', { detail: setStore({
              ...store,
              assets,
              paramElement: { ...store.paramElement, [event.data.data.id]: { rect: null, status: 'loading', rnd: '' }},
              assetElement: { ...store.assetElement, [event.data.data.id]: { rect: null, status: 'loading', rnd: '' }},
              nodeElement: { ...store.nodeElement, [event.data.data.id]: { rect: null, status: 'loading', rnd: '' }},
          })}));
          break;
        }

        case USE_REMOVE_ASSET: {
          const index = store.assets.findIndex((a: any) => a.asset?.id === event.data.data.assetId);
          const assets = store.assets;
          assets.splice(index, 1);

          dispatchEvent(new CustomEvent('store', { detail: setStore({ ...store, assets, digest: '' })}));
          break;
        }
      }
    },
    false
  );

  app({
    subscriptions: () => [listen('store', Response)] as any,
    init: store,
    view: ({
             assets,
             root,
             digest,
             configured,
             activeAssetId,
             scale,
             theme,
             changed,
             paramElement,
             nodeElement,
             assetElement,
    }) =>
      h('div', { class: 'w-full h-full flex flex-col relative' }, [
        (
          Object.values(paramElement).some((a: any) => a.status === 'loading') ||
          Object.values(nodeElement).some((a: any) => a.status === 'loading') ||
          Object.values(assetElement).some((a: any) => a.status === 'loading')
        ) ?
          h('div', { class: 'absolute z-50 w-full h-full' }, [
            h('div', { class: 'w-full h-full bg-black absolute z-30 opacity-60' }),
            h('div', { class: 'absolute z-20 w-full h-full' }, loader())
          ])
          :
          null,

        (
          Object.values(paramElement).some((a: any) => a.status === 'error') ||
          Object.values(nodeElement).some((a: any) => a.status === 'error') ||
          Object.values(assetElement).some((a: any) => a.status === 'error')
        ) ?
          h('div', { class: 'absolute z-60 w-full h-full' }, [
            h('div', { class: 'w-full h-full bg-black absolute z-40 opacity-60' }),
            h('div', { class: 'absolute z-50 w-full h-full flex justify-center items-center' }, [
              h('button', {
                innerHTML: 'Reload',
                class: 'bg-white text-black font-thin hover:opacity-80 rounded-lg py-2 px-5',
                onclick: (s, e) => {
                  const st = { ...s };
                  assets.forEach((as: any) => {
                    const id = as.asset?.id;
                    st.paramElement = { ...st.paramElement, [id]: { ...paramElement[id], status: 'loading', rnd: Math.random().toString() }};
                    st.nodeElement = { ...st.nodeElement, [id]: { ...nodeElement[id], status: 'loading', rnd: Math.random().toString() }};
                    st.assetElement = { ...st.assetElement, [id]: { ...assetElement[id], status: 'loading', rnd: Math.random().toString() }};
                  });
                  return st;
                }
              })
            ]),
          ])
          :
          null,


        h('header', { id: 'header', class: 'h-8 border-b border-b-base-300 flex justify-between items-center' }, [
          h('div', { class: 'w-1/3' }),
          h('div', { class: 'w-1/3 flex gap-x-5 justify-center' }, [
            h('div', { class: 'relative' }, [
              h('button', {
                class: 'btn btn-xs',
                innerHTML: 'Generate',
                onclick: (s) => generate(s),
              }),
              changed ?
                h('div', { style: { right: '-15px' }, class: 'absolute top-0'}, [h('p', { innerHTML: '*'})])
                : null
            ]),
            (IS_CHECK || IS_DEV) ? h('div', {}, [
              h('button', {
                class: 'btn btn-xs',
                innerHTML: 'Repeat',
                onclick: (s) => repeat(s),
              })
            ]) : null,
            // h('button', {
            //   class: 'btn btn-xs',
            //   innerHTML: 'Capture',
            //   onclick: (s) => {
            //     capture(s);
            //     return s;
            //   },
            // }),
          ]),
          h('div', { class: 'w-1/3 flex justify-end items-center' },
            assets.length ? h('div', { class: 'px-2 text-xs', innerHTML: `${Math.floor(scale * 100)}%` }) : null
          ),
        ]),
        h('main', { id: 'main', class: 'relative flex-grow w-full' }, [
          h('aside', {
            id: 'left',
            class: 'border-r border-r-base-300 bg-base-100 overflow-hidden select-none absolute z-20 w-250 h-full top-0 left-0',
            style: {
              width: '250px',
            }
          },
            h('div', { class: 'h-full p-[5px] font-sm overflow-scroll' }, [
              assets.length ? h('h2', {
                class: `cursor-pointer hover:opacity-80 ${activeAssetId === -1 ? 'font-bold' : 'font-light'}`,
                innerHTML: 'Token',
                onclick: (s) => {
                  setActiveAssetId(-1);
                  return setStore({ ...s, activeAssetId: -1 });
                },
              }) : null,
              configured ? h('div', { class: 'h-auto' },
                assets.map((as: any) => {
                  const rnd = nodeElement[as.asset.id]?.rnd;
                  const _url = getUrl(as.asset.metadata.artifactUri);
                  const url = `${_url}?node=0&type=2&hash=${initHash}&name=${as.asset.name}&rnd=${rnd}`;
                  const height = nodeElement[as.asset.id]?.rect?.height ?? 0;
                  return h('div', {
                      style: {
                        height: height > 0 ? `${height}px` : '100%',
                      }
                    },
                    renderIframe(url, (s, e) => {
                      try {
                        e.currentTarget.contentWindow.origin;
                      } catch (e) {
                        return setStore({
                          ...s,
                          nodeElement: {
                            ...s.nodeElement,
                            [as.asset.id]: { ...s.nodeElement[as.asset.id], status: 'error' }
                          }
                        });
                      }
                      proxy[as.asset.id]['node'] = e.currentTarget.contentWindow;
                      return setStore({
                        ...s,
                        nodeElement: {
                          ...s.nodeElement,
                          [as.asset.id]: { ...s.nodeElement[as.asset.id], status: 'success' }
                        }
                      });
                    }, (s, e) => {
                      return setStore({
                        ...s,
                        nodeElement: {
                          ...s.nodeElement,
                          [as.asset.id]: { ...s.nodeElement[as.asset.id], status: 'error' }
                        }
                      });
                    })
                  )
                })
              ) : null,
            ])
          ),

          configured ? h('div', {
            id: 'container',
            class: 'absolute w-full h-full z-10 flex justify-center items-center overflow-hidden'
          },
            assets.map((as: any) => {
              const rnd = assetElement[as.asset.id]?.rnd;
              const _url = getUrl(as.asset.metadata.artifactUri);
              const url = `${_url}?node=0&type=3&data=0&hash=${initHash}&name=${as.asset.name}&rnd=${rnd}`;
              return h('div',
                {
                  style: {
                    position: 'absolute',
                    width: `${root.width.value}px`,
                    height: `${root.height.value}px`,
                    transform: `scale(${scale})`,
                  }
                },
                renderIframe(url, (st, e) => {
                  try {
                    e.currentTarget.contentWindow.origin;
                  } catch (e) {
                    return setStore({
                      ...st,
                      assetElement: {
                        ...st.assetElement,
                        [as.asset.id]: { ...st.assetElement[as.asset.id], status: 'error' }
                      }
                    });
                  }

                  proxy[as.asset.id]['asset'] = e.currentTarget.contentWindow;
                  let s = generate(st);
                  return setStore({
                    ...st,
                    assetElement: {
                      ...s.assetElement,
                      [as.asset.id]: { ...s.assetElement[as.asset.id], status: 'success' }
                    }
                  });
                }, (s, e) => {
                  return setStore({
                    ...s,
                    assetElement: {
                      ...s.assetElement,
                      [as.asset.id]: { ...s.assetElement[as.asset.id], status: 'error' }
                    }
                  });
                })
              )
            })
          ) : null,

          h('aside', {
            id: 'right',
            class: 'border-l overflow-hidden  border-l-base-300 bg-base-100 select-none absolute z-20 w-250 h-full top-0 right-0',
            style: {
              width: '250px',
            }
          },
            [
              activeAssetId === -1 && assets.length ?
                h('div', { class: 'h-full' }, [
                  h('main', { class: 'p-1' }, [
                    h('h5', { innerHTML: 'Size', class: 'text-sm' }),
                    tabComponent(
                      {
                        mode: root.sizeMode,
                        onChange: (state: any, mode: any) => {
                          // const st = preSetState();
                          return setStore({ ...state, root: { ...state.root, sizeMode: mode } });
                        }
                      },
                      [
                        {
                          title: 'Random',
                          key: 'rnd'
                        },
                        {
                          title: 'Template',
                          key: 'tmpl'
                        },
                        {
                          title: 'Custom',
                          key: 'cstm'
                        }
                      ]
                    ),

                    root.sizeMode === 'rnd' &&
                    h('div', { class: 'py-2' }, [
                      h('div', {}, [
                        h('h3', { class: 'text-xs pb-1', innerHTML: 'Width' }),
                        h('div', { class: 'flex gap-x-2' }, [
                          h('div', { class: 'w-1/2' }, [
                            inputComponent(
                              {
                                name: 'Min',
                                value: root.width.minW,
                                oninput: (state: any, event: any) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  const val = root.width.step ? parseFloat(event.target.value) : parseInt(event.target.value);
                                  if (isNaN(val)) {
                                    event.target.classList.add('input-error');
                                    return state;
                                  }
                                  if (val > root.width.maxMax) {
                                    event.target.classList.add('input-error');
                                    return state;
                                  }
                                  if (val < root.width.minMin) {
                                    event.target.classList.add('input-error');
                                    return state;
                                  }

                                  event.target.classList.remove('input-error');
                                  return { ...state, changed: true, root: { ...state.root, width: { ...state.root.width, minW: val }}}
                                }
                              },
                              {
                                min: root.width.minMin,
                                max: root.width.maxMax,
                                step: root.width.step
                              }
                            )
                          ]),
                          h('div', { class: 'w-1/2' }, [
                            inputComponent(
                              {
                                name: 'Max',
                                value: root.width.maxW,
                                oninput: (state: any, event: any) => {
                                  const val = root.width.step ? parseFloat(event.target.value) : parseInt(event.target.value);
                                  if (isNaN(val)) {
                                    event.target.classList.add('input-error');
                                    return state;
                                  }
                                  if (val > root.width.maxMax) {
                                    event.target.classList.add('input-error');
                                    return state;
                                  }
                                  if (val < root.width.minMin) {
                                    event.target.classList.add('input-error');
                                    return state;
                                  }

                                  event.target.classList.remove('input-error');
                                  // return setState(state, { maxW: val });
                                  return { ...state, changed: true, root: { ...state.root, width: { ...state.root.width, maxW: val }}}
                                }
                              },
                              {
                                min: root.width.minMin,
                                max: root.width.maxMax,
                                step: root.width.step
                              }
                            )
                          ])
                        ])
                      ]),
                      h('div', {}, [
                        h('h3', { class: 'text-xs pb-1 pt-1', innerHTML: 'Height' }),
                        h('div', { class: 'flex gap-x-2' }, [
                          h('div', { class: 'w-1/2' }, [
                            inputComponent(
                              {
                                name: 'Min',
                                value: root.height.minH,
                                oninput: (state: any, event: any) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  const val = root.height.step ? parseFloat(event.target.value) : parseInt(event.target.value);
                                  if (isNaN(val)) {
                                    event.target.classList.add('input-error');
                                    return state;
                                  }
                                  if (val > root.height.maxMax) {
                                    event.target.classList.add('input-error');
                                    return state;
                                  }
                                  if (val < root.height.minMin) {
                                    event.target.classList.add('input-error');
                                    return state;
                                  }

                                  event.target.classList.remove('input-error');
                                  // return setState(state, { minH: val });
                                  return { ...state, changed: true, root: { ...state.root, height: { ...state.root.height, minH: val }}}
                                }
                              },
                              {
                                min: root.height.minMin,
                                max: root.height.maxMax,
                                step: root.height.step
                              }
                            )
                          ]),
                          h('div', { class: 'w-1/2' }, [
                            inputComponent(
                              {
                                name: 'Max',
                                value: root.height.maxH,
                                oninput: (state: any, event: any) => {
                                  const val = root.height.step ? parseFloat(event.target.value) : parseInt(event.target.value);
                                  if (isNaN(val)) {
                                    event.target.classList.add('input-error');
                                    return state;
                                  }
                                  if (val > root.height.maxMax) {
                                    event.target.classList.add('input-error');
                                    return state;
                                  }
                                  if (val < root.height.minMin) {
                                    event.target.classList.add('input-error');
                                    return state;
                                  }

                                  event.target.classList.remove('input-error');
                                  // return setState(state, { maxH: val });
                                  return { ...state, changed: true, root: { ...state.root, height: { ...state.root.height, maxH: val }}}
                                }
                              },
                              {
                                min: root.height.minMin,
                                max: root.height.maxMax,
                                step: root.height.step
                              }
                            )
                          ])
                        ])
                      ])
                    ]),

                    root.sizeMode === 'cstm' &&
                    h('div', { class: 'py-2' }, [
                      h('div', { class: 'flex gap-x-2' }, [
                        h('div', { class: 'w-1/2' }, [
                          inputComponent(
                            {
                              name: 'Width',
                              value: root.width.value,
                              oninput: (state: any, event: any) => {
                                const val = root.width.step ? parseFloat(event.target.value) : parseInt(event.target.value);
                                if (isNaN(val)) {
                                  event.target.classList.add('input-error');
                                  return state;
                                }
                                if (val > root.width.maxMax) {
                                  event.target.classList.add('input-error');
                                  return state;
                                }
                                if (val < root.width.minMin) {
                                  event.target.classList.add('input-error');
                                  return state;
                                }

                                event.target.classList.remove('input-error');
                                // return setState(state, { width: val });
                                return { ...state, changed: true, root: { ...state.root, width: { ...state.root.width, value: val }}};
                              }
                            },
                            {
                              min: root.width.minMin,
                              max: root.width.maxMax,
                              step: root.width.step
                            }
                          )
                        ]),
                        h('div', { class: 'w-1/2' }, [
                          inputComponent(
                            {
                              name: 'Height',
                              value: root.height.value,
                              oninput: (state: any, event: any) => {
                                const val = root.width.step ? parseFloat(event.target.value) : parseInt(event.target.value);
                                if (isNaN(val)) {
                                  event.target.classList.add('input-error');
                                  return state;
                                }
                                if (val > root.width.maxMax) {
                                  event.target.classList.add('input-error');
                                  return state;
                                }
                                if (val < root.width.minMin) {
                                  event.target.classList.add('input-error');
                                  return state;
                                }

                                event.target.classList.remove('input-error');
                                // return setState(state, { height: val });
                                return { ...state, changed: true, root: { ...state.root, height: { ...state.root.height, value: val }}};
                              }
                            },
                            {
                              min: root.height.minMin,
                              max: root.height.maxMax,
                              step: root.height.step
                            }
                          )
                        ])
                      ])
                    ]),

                    root.sizeMode === 'tmpl' &&
                    h('div', { class: 'py-2' }, [
                      h(
                        'select',
                        {
                          class: 'select select-bordered select-xs w-full max-w-xs',
                          onchange: (s: any, e) => {
                            const tmplIdx = (e.target as HTMLSelectElement).value as unknown as number;
                            const t = TEMPLATE_FORMATS[tmplIdx];
                            // @ts-ignore
                            let scale = getScale(t.width, t.height);
                            return setStore({ ...s, scale, changed: true, root: { ...s.root, tmplIdx: tmplIdx,
                                width: { ...s.root.width, value: t.width },
                                height: { ...s.root.height, value: t.height },
                              }});
                          }
                        },
                        [
                          // h('option', { selected: false, value: '-1', innerHTML: 'Current Format' }),
                          ...TEMPLATE_FORMATS.map((fr, i) =>
                            h('option', {
                              value: i,
                              selected: i == root.tmplIdx,
                              innerHTML: fr.label
                            })
                          )
                        ]
                      )
                    ]),

                    // result out
                    h('div', { class: 'text-xs' }, [h('h5', { class: '', innerHTML: 'Current: ' }, [h('b', { id: 'result_size', innerHTML: `${root.width.value}x${root.height.value}` })])]),

                    h('div', { class: 'divider my-0' })
                  ]),
                ])
                : null,
              configured ? h('div', { class: 'h-full overflow-scroll' },
                assets.map((as: any) => {
                  const rnd = paramElement[as.asset.id]?.rnd;
                  const _url = getUrl(as.asset.metadata.artifactUri);
                  const url = `${_url}?node=0&type=1&hash=${initHash}&rnd=${rnd}`;
                  const height = paramElement[as.asset.id]?.rect?.height ?? 0;
                  return h('div', {
                      style: {
                        height: height > 0 ? `${height}px` : '100%',
                        display: activeAssetId === as.asset?.id ? 'block' : 'none'
                      }
                    },
                    renderIframe(url, (s, e) => {
                      try {
                        e.currentTarget.contentWindow.origin;
                      } catch (e) {
                        return setStore({
                          ...s,
                          paramElement: {
                            ...s.paramElement,
                            [as.asset.id]: { ...s.paramElement[as.asset.id], status: 'error' }
                          }
                        });
                      }
                      proxy[as.asset.id]['param'] = e.currentTarget.contentWindow;
                      return setStore({
                        ...s,
                        paramElement: {
                          ...s.paramElement,
                          [as.asset.id]: { ...s.paramElement[as.asset.id], status: 'success' }
                        }
                      });
                    }, (s, e) => {
                      return setStore({
                        ...s,
                        paramElement: {
                          ...s.paramElement,
                          [as.asset.id]: { ...s.paramElement[as.asset.id], status: 'error' }
                        }
                      });
                    })
                  )
                })
              ) : null
            ]
          ),
        ]),
        h('footer', {
          id: 'footer', class: 'px-2 h-8 overflow-hidden border-t border-t-base-300 w-full border-b border-b-base-300 flex justify-between items-center' },
          [
            h('div', { class: 'text-xs flex justify-between items-center' }, [
              !digest && assets.length ? h('div', { class: 'animate-ping inline-flex h-1 w-1 rounded-full bg-primary opacity-75' }) : null,
              digest && assets.length ? h('p', { class: 'opacity-60', innerHTML: digest }) : null
            ]),
            h('div', { class: 'overflow-hidden', style: { width: '100px' } },
              h('select', {
                class: 'select font-medium opacity-50 text-right select-xs text-xs select-ghost outline-none',
                onchange: (s, e) => {
                  // TODO OPTIMIZATION
                  const theme = (e.target as HTMLSelectElement).value;
                  localStorage.setItem('theme', theme);

                  store.assets.forEach((a: any) => {
                    proxy[a.asset.id]?.['param']?.postMessage({ type: USE_SET_THEME, data: { theme } }, getUrl(a.asset.metadata.artifactUri));
                    proxy[a.asset.id]?.['node']?.postMessage({ type: USE_SET_THEME, data: { theme } }, getUrl(a.asset.metadata.artifactUri));
                    proxy[a.asset.id]?.['asset']?.postMessage({ type: USE_SET_THEME, data: { theme } }, getUrl(a.asset.metadata.artifactUri));
                  });

                  const doc = document.querySelector('html');
                  if (doc) {
                    doc.dataset.theme = theme;
                  }

                  return setStore({ ...s, theme });
                }
                },
                THEMES.map(th => h('option', { selected: theme === th, innerHTML: th }))
              )
            )
          ]
        )
      ]),
    node: container
  });
}
