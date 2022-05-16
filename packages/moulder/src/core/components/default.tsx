import React from 'react';
import { random } from '../random';
import { IMoulderComponent } from '../types';
import { InputContainer, TabContainer } from './basic';

type TStateBetweenComp = {
  name: string;
  value: any;
  mode: string;
  [key: string]: any;
};

export const betweenComponent = (): IMoulderComponent => {
  return {
    call: (state: TStateBetweenComp) => {
      state.mode = state.mode ?? 'rnd';
      state.minMin = state.minMin ?? state.min ?? 0;
      state.maxMax = state.maxMax ?? state.max ?? 10;
      const isFloat = state.float || state.step;
      if (isFloat && !state.step) {
        state.step = 0.01;
      }
      // out
      state.value =
        state.mode === 'rnd'
          ? isFloat
            ? random().between(parseInt(state.min), parseInt(state.max))
            : random().betweenInt(parseInt(state.min), parseInt(state.max))
          : parseInt(state.value);
      return state.value; // validation ?? yes
    },
    render: (
      props: TStateBetweenComp,
      setState: (state: Partial<TStateBetweenComp>) => void
    ) => {
      const { state } = props;
      return (
        <main className={'p-1'}>
          <h5 className={'text-sm'}>{props.name}</h5>
          <header>
            <TabContainer
              navs={[
                {
                  title: 'Random',
                  key: 'rnd',
                },
                {
                  title: 'Custom',
                  key: 'cstm',
                },
              ]}
              mode={state.mode ?? 'rnd'}
              onChange={(mode) => {
                setState({ mode });
              }}
            />
          </header>
          <section>
            {state.info ? (
              <p className={'text-xs italic'}>{state.info}</p>
            ) : null}
            {state.mode === 'rnd' ? (
              <div className={'py-2'}>
                <div className={'flex gap-x-2'}>
                  <div className={'w-1/2'}>
                    <InputContainer
                      label={'Min'}
                      value={state.min}
                      onInput={(event) => {
                        const target = event.target as HTMLInputElement;
                        const val = state.step
                          ? parseFloat(target.value)
                          : parseInt(target.value);
                        if (isNaN(val)) {
                          target.classList.add('input-error');
                          return state;
                        }
                        if (val > state.max || val > state.maxMax) {
                          target.classList.add('input-error');
                          return state;
                        }
                        if (val < state.minMin) {
                          target.classList.add('input-error');
                          return state;
                        }
                        target.classList.remove('input-error');
                        setState({ min: val });
                      }}
                    />
                  </div>
                  <div className={'w-1/2'}>
                    <InputContainer
                      label={'Max'}
                      value={state.max}
                      onInput={(event) => {
                        const target = event.target as HTMLInputElement;
                        const val = state.step
                          ? parseFloat(target.value)
                          : parseInt(target.value);
                        if (isNaN(val)) {
                          target.classList.add('input-error');
                          return state;
                        }
                        if (val > state.maxMax) {
                          target.classList.add('input-error');
                          return state;
                        }
                        if (val < state.min || val < state.minMin) {
                          target.classList.add('input-error');
                          return state;
                        }

                        target.classList.remove('input-error');
                        setState({ max: val });
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {state.mode === 'cstm' ? (
              <div className={'py-2'}>
                <div className={'w-full'}>
                  <InputContainer
                    label={'Value'}
                    value={state.value ?? 0}
                    onInput={(event) => {
                      const target = event.target as HTMLInputElement;
                      const val = state.step
                        ? parseFloat(target.value)
                        : parseInt(target.value);
                      if (isNaN(val)) {
                        target.classList.add('input-error');
                        return state;
                      }
                      if (val > state.maxMax) {
                        target.classList.add('input-error');
                        return state;
                      }
                      if (val < state.minMin) {
                        target.classList.add('input-error');
                        return state;
                      }

                      target.classList.remove('input-error');
                      setState({ value: val });
                    }}
                  />
                </div>
              </div>
            ) : null}
          </section>

          <div className={'text-xs'}>
            <h5>
              Current: <b>{state.value}</b>
            </h5>
          </div>

          <div className={'divider my-0'} />
        </main>
      );
    },
  };
};

type TStateBooleanComp = {
  name: string;
  value: any;
  [key: string]: any;
};

export const booleanComponent = (): IMoulderComponent => {
  return {
    call: (state: TStateBooleanComp) => {
      // default options
      state.mode = state.mode ?? 'rnd';
      state.value =
        state.mode === 'rnd'
          ? random().random() > 0.5
          : state.value ?? random().random();
      return state.value; // validation ?? yes
    },
    render: (
      props: TStateBooleanComp,
      setState: (state: Partial<TStateBooleanComp>) => void
    ) => {
      const { state } = props;
      return (
        <main className={'p-1'}>
          <h5 className={'text-sm'}>{props.name}</h5>
          <header>
            <TabContainer
              navs={[
                {
                  title: 'Random',
                  key: 'rnd',
                },
                {
                  title: 'Custom',
                  key: 'cstm',
                },
              ]}
              mode={state.mode ?? 'rnd'}
              onChange={(mode) => {
                setState({ mode });
              }}
            />
          </header>
          <section>
            {state.mode === 'rnd' ? <div className={'py-1'}></div> : null}

            {state.mode === 'cstm' ? (
              <div className={'py-2'}>
                <div
                  className={
                    'text-xs w-full flex justify-start gap-x-2 items-center'
                  }
                >
                  <div>Off</div>
                  <input
                    checked={state.value}
                    type={'checkbox'}
                    onChange={(e) => {
                      setState({
                        value: (e.target as HTMLInputElement).checked,
                      });
                    }}
                    className={'toggle toggle-xs'}
                  />
                  <div>On</div>
                </div>
              </div>
            ) : null}
          </section>

          <div className={'text-xs'}>
            <h5>
              Current: <b>{state.value ? 'On' : 'Off'}</b>
            </h5>
          </div>

          <div className={'divider my-0'} />
        </main>
      );
    },
  };
};
