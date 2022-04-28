import { random } from './hash';
import { hexToRgb, rgbToHex } from './utils';

import { h, app } from 'hyperapp';

export const tools: any = {};

// register
export const createTool = (options: any = {}, func: (options: any) => any) => {
  tools[options.name] = func(options);
};

/**
 * New implement
 * use hyperapp for render
 * use tailwind and daisyui for ui
 */
export const tabComponent = (props: any, nav: any[] = []): any => {
  return h(
    'div',
    { class: 'tabs tabs-boxed w-full' },
    nav.map((nv) =>
      h('a', {
        style: {
          width: `${100 / nav.length}%`
        },
        class: `tab tab-xs ${nv.key === props.mode ? 'tab-active' : ''}`,
        onclick: [props.onChange, nv.key],
        innerHTML: nv.title
      })
    ) as any
  );
};

export const inputComponent = ({ oninput, name, value }: any, inputOptions: any = {}): any => {
  return h('div', { class: 'form-control' }, [
    h('label', { class: 'input-group input-group-xs' }, [
      h('span', { class: 'px-1', innerHTML: name }),
      h('input', {
        class: 'input appearance-none input-bordered text-xs input-xs w-full',
        defaultValue: value,
        oninput,
        type: 'number',
        ...inputOptions
      })
    ])
  ]);
};

createTool({ name: 'between' }, (options = {}) => {
  return {
    call: (state: any = {}) => {
      // default options
      state.mode = state.mode ?? 'rnd';
      state.minMin = state.minMin ?? state.min ?? 0;
      state.maxMax = state.maxMax ?? state.max ?? 10;
      const isFloat = state.float || state.step;
      if (isFloat && !state.step) {
        state.step = 0.01;
      }
      // out
      state.out =
        state.mode === 'rnd'
          ? isFloat
            ? random().between(parseInt(state.min), parseInt(state.max))
            : random().betweenInt(parseInt(state.min), parseInt(state.max))
          : parseInt(state.out);
      return state.out; // validation ?? yes
    },
    render: (state: any = {}, subscriptions: any, setState: (state: any, newState: any) => void) => {
      const container = document.createElement('div');

      app({
        init: state,
        subscriptions,
        view: ({ min, max, mode, out }) =>
          h('main', { class: 'p-1' }, [
            h('h5', { innerHTML: state.title, class: 'text-sm' }),
            tabComponent(
              {
                mode,
                onChange: (state: any, mode: any) => setState(state, { mode })
              },
              [
                {
                  title: 'Random',
                  key: 'rnd'
                },
                {
                  title: 'Custom',
                  key: 'cstm'
                }
              ]
            ),

            mode === 'rnd' &&
              h('div', { class: 'py-2' }, [
                h('div', { class: 'flex gap-x-2' }, [
                  h('div', { class: 'w-1/2' }, [
                    inputComponent(
                      {
                        name: 'Min',
                        value: min,
                        oninput: (state: any, event: any) => {
                          const val = state.step ? parseFloat(event.target.value) : parseInt(event.target.value);
                          if (isNaN(val)) {
                            event.target.classList.add('input-error');
                            return state;
                          }
                          if (val > state.max || val > state.maxMax) {
                            event.target.classList.add('input-error');
                            return state;
                          }
                          if (val < state.minMin) {
                            event.target.classList.add('input-error');
                            return state;
                          }

                          event.target.classList.remove('input-error');
                          return setState(state, { min: val });
                        }
                      },
                      {
                        min: state.minMin,
                        max: Math.min(max, state.maxMax),
                        step: state.step
                      }
                    )
                  ]),
                  h('div', { class: 'w-1/2' }, [
                    inputComponent(
                      {
                        name: 'Max',
                        value: max,
                        oninput: (state: any, event: any) => {
                          const val = state.step ? parseFloat(event.target.value) : parseInt(event.target.value);
                          if (isNaN(val)) {
                            event.target.classList.add('input-error');
                            return state;
                          }
                          if (val > state.maxMax) {
                            event.target.classList.add('input-error');
                            return state;
                          }
                          if (val < state.min || val < state.minMin) {
                            event.target.classList.add('input-error');
                            return state;
                          }

                          event.target.classList.remove('input-error');
                          return setState(state, { max: val });
                        }
                      },
                      {
                        min: Math.max(min, state.minMin),
                        max: state.maxMax,
                        step: state.step
                      }
                    )
                  ])
                ])
              ]),

            mode === 'cstm' &&
              h('div', { class: 'py-2' }, [
                h('div', { class: 'w-full' }, [
                  inputComponent(
                    {
                      name: 'Value',
                      value: out ?? 0,
                      oninput: (state: any, event: any) => {
                        const val = state.step ? parseFloat(event.target.value) : parseInt(event.target.value);
                        if (isNaN(val)) {
                          event.target.classList.add('input-error');
                          return state;
                        }
                        if (val > state.maxMax) {
                          event.target.classList.add('input-error');
                          return state;
                        }
                        if (val < state.minMin) {
                          event.target.classList.add('input-error');
                          return state;
                        }

                        event.target.classList.remove('input-error');
                        return setState(state, { out: val });
                      }
                    },
                    {
                      min: state.minMin,
                      max: state.maxMax,
                      step: state.step
                    }
                  )
                ])
              ]),

            // result out
            h('div', { class: 'text-xs' }, [h('h5', { class: '', innerHTML: 'Current: ' }, [h('b', { class: '', innerHTML: out })])]),

            h('div', { class: 'divider my-0' })
          ]),
        node: container
      });

      return container;
    }
  };
});

createTool({ name: 'color' }, (options = {}) => {
  return {
    call: (state: any = {}) => {
      // default options
      state.mode = state.mode ?? 'rnd';
      const r = Math.floor(random().random() * 256);
      const g = Math.floor(random().random() * 256);
      const b = Math.floor(random().random() * 256);
      state.out = state.mode === 'rnd' ? `rgb(${r}, ${g}, ${b})` : state.out ?? '#ffffff';
      return state.out; // validation ?? yes
    },
    render: (state: any = {}, subscriptions: any, setState: (state: any, newState: any) => void) => {
      const container = document.createElement('div');

      app({
        init: state,
        subscriptions,
        view: ({ mode, out }) =>
          h('main', { class: 'p-1' }, [
            h('h5', { innerHTML: state.title, class: 'text-sm' }),
            tabComponent(
              {
                mode,
                onChange: (state: any, mode: any) => setState(state, { mode })
              },
              [
                {
                  title: 'Random',
                  key: 'rnd'
                },
                {
                  title: 'Custom',
                  key: 'cstm'
                }
              ]
            ),

            mode === 'cstm' &&
              h('div', { class: 'py-2' }, [
                h('div', { class: 'w-1/2' }, [
                  inputComponent(
                    {
                      value: out.startsWith('rgb') ? rgbToHex(out) : out,
                      name: 'Value',
                      oninput: (state: any, event: any) => {
                        return setState(state, { out: hexToRgb(event.target.value) });
                      }
                    },
                    {
                      type: 'color'
                    }
                  )
                ])
              ]),

            mode === 'rnd' && h('div', { class: 'py-1' }),

            // result out
            h('div', { class: 'text-xs' }, [
              h('h5', { class: ' flex items-center', innerHTML: 'Current: ' }, [
                h('b', {
                  style: { background: out },
                  class: 'ml-1 w-3 h-3 inline-block font-medium rounded-sm'
                }),
                h('b', {
                  class: 'px-1 rounded-sm',
                  innerHTML: out
                })
              ])
            ]),

            h('div', { class: 'divider my-0' })
          ]),
        node: container
      });

      return container;
    }
  };
});

createTool({ name: 'boolean' }, (options = {}) => {
  return {
    call: (state: any = {}) => {
      // default options
      state.mode = state.mode ?? 'rnd';
      state.out = state.mode === 'rnd' ? random().random() > 0.5 : state.out ?? random().random();
      return state.out; // validation ?? yes
    },
    render: (state: any = {}, subscriptions: any, setState: (state: any, newState: any) => void) => {
      const container = document.createElement('div');

      app({
        init: state,
        subscriptions,
        view: ({ mode, out }) =>
          h('main', { class: 'p-1' }, [
            h('h5', { innerHTML: state.title, class: 'text-sm' }),
            tabComponent(
              {
                mode,
                onChange: (state: any, mode: any) => setState(state, { mode })
              },
              [
                {
                  title: 'Random',
                  key: 'rnd'
                },
                {
                  title: 'Custom',
                  key: 'cstm'
                }
              ]
            ),

            mode === 'cstm' &&
              h('div', { class: 'py-2' }, [
                h('div', { class: 'text-xs w-full flex justify-start gap-x-2 items-center' }, [
                  h('div', { innerHTML: 'Off' }),
                  h('input', {
                    type: 'checkbox',
                    class: 'toggle toggle-xs',
                    checked: out,
                    onchange: (state, event) => {
                      return setState(state, { out: (event.target as HTMLInputElement).checked });
                    }
                  }),
                  h('div', { innerHTML: 'On' })
                ])
              ]),

            mode === 'rnd' && h('div', { class: 'py-1' }),

            // result out
            // result out
            h('div', { class: 'text-xs' }, [h('h5', { class: '', innerHTML: 'Current: ' }, [h('b', { class: '', innerHTML: out ? 'On' : 'Off' })])]),

            h('div', { class: 'divider my-0' })
          ]),
        node: container
      });

      return container;
    }
  };
});

createTool({ name: 'palette' }, (options = {}) => {
  return {
    call: (state: any = {}) => {
      // default options
      state.mode = state.mode ?? 'rnd';
      let res = [];
      let count = state.count ?? 1;
      count = count > state.array.length ? state.array.length : count;
      state.count = count;
      if (state.mode === 'rnd') {
        res = [...state.array.filter((a: any) => a.active || a.active === undefined)].sort(() => 0.5 - random().random()).slice(0, count);
      } else if (state.mode === 'cstm') {
        res = state.array.filter((a: any) => a.active).slice(0, count);
      }
      state.out = res.map((a: any) => a.value);
      return state.out; // validation ?? yes
    },
    render: (state: any = {}, subscriptions: any, setState: (state: any, newState: any) => void) => {
      const container = document.createElement('div');

      app({
        init: state,
        subscriptions,
        view: ({ mode, out, array, count }) =>
          h('main', { class: 'p-1' }, [
            h('h5', { innerHTML: state.title, class: 'text-sm' }),
            tabComponent(
              {
                mode,
                onChange: (state: any, mode: any) => setState(state, { mode })
              },
              [
                {
                  title: 'Random',
                  key: 'rnd'
                },
                {
                  title: 'Custom',
                  key: 'cstm'
                }
              ]
            ),

            mode === 'rnd' &&
              h('div', { class: 'py-2' }, [
                h('div', { class: 'text-xs w-full flex flex-col justify-center gap-y-2 items-start' }, [
                  ...array.map((arr: any, i: any) =>
                    h('div', { class: 'flex justify-center items-center' }, [
                      h('input', {
                        type: 'checkbox',
                        class: 'checkbox checkbox-xs',
                        checked: arr.active === undefined || arr.active,
                        onchange: (state, event) => {
                          const _arr = [...array];
                          _arr[i].active = (event.target as HTMLInputElement).checked;
                          if (_arr.filter((a) => a.active || a.active === undefined).length < count) {
                            (event.target as HTMLInputElement).classList.add('input-error');
                            return state;
                          }
                          (event.target as HTMLInputElement).classList.remove('input-error');
                          return setState(state, { array: _arr });
                        }
                      }),
                      h('p', { class: 'flex items-center' }, [
                        ...arr.value.map((a: any) =>
                          h('b', {
                            style: { background: a },
                            class: 'ml-1 w-3 h-3 inline-block font-medium rounded-sm'
                          })
                        )
                      ])
                    ])
                  )
                ])
              ]),

            mode === 'cstm' &&
              h('div', { class: 'py-2' }, [
                h('div', { class: 'text-xs w-full flex flex-col justify-center gap-y-2 items-start' }, [
                  ...array.map((arr: any, i: any) =>
                    h('div', { class: 'flex justify-center items-center' }, [
                      h('input', {
                        type: 'radio',
                        class: 'radio radio-xs',
                        checked: out.map((a: any) => a.join('')).includes(array[i].value.join('')) ?? array[i].active,
                        onchange: (state, event) => {
                          const check = (event.target as HTMLInputElement).checked;
                          const _arr = [...array].map((a) => {
                            return { ...a, active: false };
                          });
                          _arr[i].active = check;
                          return setState(state, {
                            array: _arr,
                            out: _arr
                              .filter((a) => a.active)
                              .slice(0, count)
                              .map((a) => a.value)
                          });
                        }
                      }),
                      h('p', { class: 'flex items-center' }, [
                        ...arr.value.map((a: any) =>
                          h('b', {
                            style: { background: a },
                            class: 'ml-1 w-3 h-3 inline-block font-medium rounded-sm'
                          })
                        )
                      ])
                    ])
                  )
                ])
              ]),

            // result out
            h('div', { class: 'text-xs' }, [
              h('h5', { class: '', innerHTML: 'Current: ' }, []),
              h('div', {}, [
                ...out.map((arr: any) =>
                  h('div', {}, [
                    ...arr.map((a: any) =>
                      h('b', {
                        style: { background: a },
                        class: 'first:ml-0 ml-1 w-3 h-3 inline-block font-medium rounded-sm'
                      })
                    )
                  ])
                )
              ])
            ]),

            h('div', { class: 'divider my-0' })
          ]),
        node: container
      });

      return container;
    }
  };
});
