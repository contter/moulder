import { container } from '../wrapper';
import { createRoot } from 'react-dom/client';
import { useEffect, useMemo, useState } from 'react';
import {
  MOULDER_CMD_REQUEST_CAPTURE,
  MOULDER_CONFIG_DEFAULT_SIZE,
  MOULDER_CONFIG_MAX_SIZE,
  MOULDER_CONFIG_MIN_SIZE,
  MOULDER_IFRAME_ALLOW,
  MOULDER_IFRAME_SANDBOX,
  MOULDER_IS_DEV,
  TEMPLATES,
  THEMES,
} from '../constants';
import { EStatusWindow, EType } from '../types';
import { deepCopy, getUrl } from '../utils';
import { Provider, rootStore, useRootStore } from '../store';
import { observer } from 'mobx-react-lite/src/observer';
import { components, registerComponent } from '../components';
import { sizeComponent } from './components';
import { autorun } from 'mobx';

registerComponent('size', sizeComponent());

const Loader = ({ className }: { className?: string }) => (
  <div
    className={`w-full h-full flex justify-center items-center ${className}`}
  >
    <svg
      className="animate-spin h-6 w-6 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
);

const RootProperties = observer(() => {
  const store = useRootStore();

  const state = useMemo(() => {
    return {
      mode: 'cstm',
      width: {
        value: MOULDER_CONFIG_DEFAULT_SIZE,
        min: MOULDER_CONFIG_DEFAULT_SIZE / 2,
        max: MOULDER_CONFIG_DEFAULT_SIZE * 1.5,
        minMin: MOULDER_CONFIG_MIN_SIZE,
        maxMax: MOULDER_CONFIG_MAX_SIZE,
      },
      height: {
        value: MOULDER_CONFIG_DEFAULT_SIZE,
        min: MOULDER_CONFIG_DEFAULT_SIZE / 2,
        max: MOULDER_CONFIG_DEFAULT_SIZE * 1.5,
        minMin: MOULDER_CONFIG_MIN_SIZE,
        maxMax: MOULDER_CONFIG_MAX_SIZE,
      },
      templates: TEMPLATES,
    };
  }, []);

  useEffect(() => {
    if (Object.keys(state).length) {
      store.root.useProperty('size', 'Size', state); // const size =
    }
  }, [state]);
  const comp = useMemo(() => components['size'], []);

  return (
    <div>
      {store.root.properties.map((prop) => (
        <div key={prop.id}>
          {comp.render(deepCopy(prop), (state) => {
            prop.change(state);
          })}
        </div>
      ))}
    </div>
  );
});

interface IIframeComp {
  onLoad?: (e: any) => void;
  url: string;
  width?: number;
  height?: number;
}

const Iframe = ({ url, onLoad }: IIframeComp) => {
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading'
  );
  const [rnd, setRnd] = useState('');

  useEffect(() => {
    if (rnd) {
      setStatus('loading');
    }
  }, [rnd, setStatus]);

  // const isParams = Object.keys(new URLSearchParams(url)).length > 0;

  //${isParams ? '&' : '?'}rnd=${rnd}
  return (
    <div className={'relative w-full h-full'}>
      {status === 'loading' ? (
        <div className={'absolute z-20 w-full h-full'}>
          <div
            className={'w-full h-full bg-transparent absolute z-10 opacity-60'}
          />
          <div className={'absolute z-20 w-full h-full'}>
            <Loader />
          </div>
        </div>
      ) : null}
      {status === 'error' ? (
        <div className={'absolute z-40 w-full h-full'}>
          <div
            className={'w-full h-full bg-transparent absolute z-10 opacity-90'}
          />
          <div
            className={
              'absolute z-20 w-full h-full flex justify-center items-center'
            }
          >
            <button
              onClick={() => {
                setRnd(Math.random.toString());
              }}
              // style={'white'}
              value={'Reload'}
            />
          </div>
        </div>
      ) : null}
      <iframe
        onLoad={(e) => {
          if (e.currentTarget) {
            setStatus('success');
            onLoad?.(e);
          }
        }}
        onError={() => {
          setStatus('error');
        }}
        width={'100%'}
        height={'100%'}
        frameBorder="0"
        src={`${url}`}
        className={'iframe overflow-hidden'}
        sandbox={MOULDER_IFRAME_SANDBOX}
        allow={MOULDER_IFRAME_ALLOW}
      />
    </div>
  );
};

const DEFAULT_PADDING = 100;

const Main = observer(() => {
  const store = useRootStore();
  const [size, setSize] = useState<{ width: number, height: number }>({
    width: MOULDER_CONFIG_DEFAULT_SIZE,
    height: MOULDER_CONFIG_DEFAULT_SIZE,
  });

  useEffect(() => {
    const doc = document.querySelector('html');
    if (doc) {
      doc.dataset.theme = store.theme;
    }
  }, [store.theme]);

  useEffect(() => {
    store.addAsset({
      id: 1,
      order: 0,
      name: 'Asset',
      url: window.location.origin + window.location.pathname,
      windows: [
        {
          id: 1,
          type: EType.ASSET,
          status: EStatusWindow.LOADING,
        },
        {
          id: 2,
          type: EType.NODE,
          status: EStatusWindow.LOADING,
        },
        {
          id: 3,
          type: EType.PROPERTY,
          status: EStatusWindow.LOADING,
        },
      ],
    });
  }, []);

  useEffect(() => {
    autorun(() => {
      store.root.properties
        .filter((a) => a.id === 'size')
        .forEach((prop) => {
          const width = prop.state.get('width').value;
          const height = prop.state.get('height').value;
          setSize({ width, height });
        });
    });
  }, []);

  const getScale = (width, height) => {
    const designWidth =
      width ?? store.root.width?.value ?? MOULDER_CONFIG_DEFAULT_SIZE;
    const designHeight =
      height ?? store.root.height?.value ?? MOULDER_CONFIG_DEFAULT_SIZE;
    const header = document.getElementById('header')?.getBoundingClientRect();
    const footer = document.getElementById('footer')?.getBoundingClientRect();
    const left = document.getElementById('left')?.getBoundingClientRect();
    const right = document.getElementById('right')?.getBoundingClientRect();
    const container = document
      .getElementById('container')
      ?.getBoundingClientRect();
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
      // store.scale = scale;
      // dispatchEvent(new CustomEvent('store', { detail: setStore({ ...store, scale }) }));
    }
    return scale;
  };

  useEffect(() => {
    store.setScale(getScale(size.width, size.height));
  }, [size.width, size.height]);

  return (
    <div className={'w-full h-full flex flex-col relative'}>
      <header
        id={'header'}
        className={
          'h-9 border-b border-b-base-300 flex justify-between items-center'
        }
      >
        <div className={'w-1/3 pl-1 flex gap-x-5 justify-start items-center'}>
          {MOULDER_IS_DEV ? (
            <p
              className={'px-1 text-black rounded-sm py-1 bg-rose-500 text-xs'}
            >
              Development mode
            </p>
          ) : null}
        </div>

        <div className={'w-1/3 flex gap-x-5 justify-center'}>
          {!store.applied ? (
            <div className={'relative'}>
              <button
                className={'btn btn-xs'}
                onClick={() => {
                  // if (isReadyButton()) {
                  //   lastButtonActivity = new Date();
                  //   store.generate();
                  // }
                  store.root.properties.forEach((prop) => {
                    const comp = components[prop.component];
                    const st = deepCopy(prop.state.toJSON());
                    const res = comp.call(st);
                    prop.change({
                      ...st,
                      width: { ...st.width, value: res[0] },
                      height: { ...st.height, value: res[1] },
                    });
                  });

                  store.generate();
                }}
              >
                Generate
              </button>
              {/*{store.changed ? <div*/}
              {/*  style={{ right: '-15px' }}*/}
              {/*  className={'absolute top-0'}>*</div> : null}*/}
            </div>
          ) : null}

          {MOULDER_IS_DEV && !store.applied ? (
            <div className={'relative'}>
              <button
                className={'btn btn-xs'}
                onClick={() => {
                  store.repeat();
                }}
              >
                Repeat
              </button>
            </div>
          ) : null}

          {MOULDER_IS_DEV && !store.applied ? (
            <div className={'relative'}>
              <button
                className={'btn btn-xs'}
                onClick={() => {
                  store.assets.forEach((a) => {
                    a.windows
                      .find((b) => b.type === EType.ASSET)
                      ?.proxy?.postMessage(
                        {
                          type: MOULDER_CMD_REQUEST_CAPTURE,
                          data: {},
                        },
                        a.url
                      );
                  });
                }}
              >
                Capture
              </button>
            </div>
          ) : null}

          {store.applied ? (
            <div className={'relative'}>
              <button
                className={'btn btn-xs'}
                onClick={() => {
                  store.unsetApplied();
                }}
              >
                Back
              </button>
            </div>
          ) : null}

          {!store.applied ? (
            <div className={'relative'}>
              <button
                className={'btn btn-xs'}
                onClick={() => {
                  store.apply();
                }}
              >
                Apply
              </button>
            </div>
          ) : null}
        </div>

        <div className={`w-1/3 flex justify-end items-center`}>
          <div className={`${store.applied ? 'hidden' : 'block'} `}>
            {store.assets.length ? (
              <p className={'px-2 text-xs'}>{Math.floor(store.scale * 100)}%</p>
            ) : null}
          </div>
        </div>
      </header>

      <main className={'relative flex-grow w-full'}>
        {store.applied ? (
          <div
            className={`absolute ${
              store.digest ? '' : 'bg-blackOpacity'
            }  z-30 w-full h-full flex justify-center items-center`}
          >
            {!store.digest ? <Loader /> : null}
          </div>
        ) : null}

        <aside
          id={'left'}
          style={{ width: '250px' }}
          className={`border-r ${
            store.applied ? 'hidden' : 'block'
          } border-r-base-300 bg-base-100 overflow-hidden select-none absolute z-20 w-250 h-full top-0 left-0`}
        >
          <div className={'h-full p-[5px] font-sm overflow-scroll'}>
            <h2
              onClick={() => {
                store.setSelected(true);
              }}
              className={`text-base ${
                store.selected ? 'font-semibold' : 'opacity-70'
              } hover:opacity-80 cursor-pointer`}
            >
              Token
            </h2>
            <div className={'h-full'}>
              {store.assets.map((a) => {
                const _url = getUrl(a.url);
                const url = `${_url}?node=0&id=${a.id}&type=${EType.NODE}&data=0&name=${a.name}`;
                return (
                  <div
                    style={{
                      height: '100%',
                    }}
                    key={a.id}
                  >
                    <Iframe
                      url={url}
                      onLoad={(e) => {
                        if (e.currentTarget.contentWindow) {
                          a.windows
                            .find((a) => a.type === EType.NODE)
                            ?.setProxy(e.currentTarget.contentWindow);
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <section
          id={'container'}
          className={
            'absolute w-full h-full z-10 flex justify-center items-center overflow-hidden'
          }
        >
          {store.assets.map((a) => {
            const _url = getUrl(a.url);
            const url = `${_url}?node=0&id=${a.id}&type=${EType.ASSET}&data=0&name=${a.name}`;
            return (
              <div
                style={{
                  height: `${size.height}px`,
                  width: `${size.width}px`,
                  zIndex: a.order,
                  position: 'absolute',
                  transform: `scale(${store.scale ?? 0.5})`,
                }}
                key={a.id}
              >
                <Iframe
                  url={url}
                  width={size.width}
                  height={size.height}
                  onLoad={(e) => {
                    if (e.currentTarget.contentWindow) {
                      a.windows
                        .find((a) => a.type === EType.ASSET)
                        ?.setProxy(e.currentTarget.contentWindow);
                    }
                  }}
                />
              </div>
            );
          })}
        </section>

        <aside
          id={'right'}
          style={{ width: '250px' }}
          className={`border-l overflow-hidden ${
            store.applied ? 'hidden' : 'block'
          } border-l-base-300 bg-base-100 select-none absolute z-20 w-250 h-full top-0 right-0`}
        >
          {store.selected ? (
            <div className={'h-full'}>
              <RootProperties />
            </div>
          ) : null}

          <div className={'h-full overflow-scroll'}>
            {store.assets.map((a) => {
              const _url = getUrl(a.url);
              const url = `${_url}?node=0&id=${a.id}&type=${EType.PROPERTY}&data=0&name=${a.name}`;
              return (
                <div
                  style={{
                    height: '100%',
                  }}
                  key={a.id}
                >
                  <Iframe
                    url={url}
                    onLoad={(e) => {
                      if (e.currentTarget.contentWindow) {
                        a.windows
                          .find((a) => a.type === EType.PROPERTY)
                          ?.setProxy(e.currentTarget.contentWindow);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </aside>
      </main>

      <footer
        id={'footer'}
        className={
          'px-2 h-9 overflow-hidden border-t border-t-base-300 w-full border-b border-b-base-300 flex justify-between items-center'
        }
      >
        <div className={'text-xs flex justify-between items-center'}>
          {!store.digest && store.applied ? (
            <div
              className={
                'animate-ping inline-flex h-1 w-1 rounded-full bg-primary opacity-75'
              }
            />
          ) : null}
          {store.digest ? <p className={'opacity-60'}>{store.digest}</p> : null}
        </div>

        <div
          style={{ width: '100px' }}
          className={`${store.applied ? 'hidden' : 'block'} overflow-hidden`}
        >
          <select
            onChange={(e) => {
              const theme = (e.target as HTMLSelectElement).value;
              store.setTheme(theme);
            }}
            value={store.theme}
            className={
              'select font-medium opacity-50 text-right select-xs text-xs select-ghost outline-none'
            }
          >
            {THEMES.map((th) => (
              <option key={th}>{th}</option>
            ))}
          </select>
        </div>
      </footer>
    </div>
  );
});

export const runEditor = () => {
  // pass
  const root = createRoot(container);
  root.render(
    <Provider value={rootStore}>
      <Main />
    </Provider>
  );
};
