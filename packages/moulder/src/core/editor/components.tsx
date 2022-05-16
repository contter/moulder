import { InputContainer, TabContainer } from '../components/basic';
import { random } from '../random';

export const sizeComponent = () => {
  return {
    call: (state) => {
      // default options
      state.mode = state.mode ?? 'cstm';
      if (state.mode === 'rnd') {
        state.width.value = random().betweenInt(
          state.width.min,
          state.width.max
        );
        state.height.value = random().betweenInt(
          state.height.min,
          state.height.max
        );
      }
      return [state.width.value, state.height.value]; // validation ?? yes
    },
    render: (props, setState: (state) => void) => {
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
                  title: 'Template',
                  key: 'tmpl',
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
            {state.mode === 'rnd' ? (
              <div className={'py-2'}>
                <div>
                  <h3 className={'text-xs pb-1'}>Width</h3>
                  <div className={'flex gap-x-2'}>
                    <div className={'w-1/2'}>
                      <InputContainer
                        label={'Min'}
                        value={state.width.min}
                        onInput={(event) => {
                          const target = event.target as HTMLInputElement;
                          const val = state.width.step
                            ? parseFloat(target.value)
                            : parseInt(target.value);
                          if (isNaN(val)) {
                            target.classList.add('input-error');
                            return state;
                          }
                          if (val > state.width.maxMax) {
                            target.classList.add('input-error');
                            return state;
                          }
                          if (val < state.width.minMin) {
                            target.classList.add('input-error');
                            return state;
                          }
                          target.classList.remove('input-error');
                          setState({ width: { ...state.width, min: val } });
                        }}
                      />
                    </div>
                    <div className={'w-1/2'}>
                      <InputContainer
                        label={'Max'}
                        value={state.width.max}
                        onInput={(event) => {
                          const target = event.target as HTMLInputElement;
                          const val = state.width.step
                            ? parseFloat(target.value)
                            : parseInt(target.value);
                          if (isNaN(val)) {
                            target.classList.add('input-error');
                            return state;
                          }
                          if (val > state.width.maxMax) {
                            target.classList.add('input-error');
                            return state;
                          }
                          if (val < state.width.minMin) {
                            target.classList.add('input-error');
                            return state;
                          }
                          target.classList.remove('input-error');
                          setState({ width: { ...state.width, max: val } });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className={'text-xs pt-1 pb-1'}>Height</h3>
                  <div className={'flex gap-x-2'}>
                    <div className={'w-1/2'}>
                      <InputContainer
                        label={'Min'}
                        value={state.height.min}
                        onInput={(event) => {
                          const target = event.target as HTMLInputElement;
                          const val = state.width.step
                            ? parseFloat(target.value)
                            : parseInt(target.value);
                          if (isNaN(val)) {
                            target.classList.add('input-error');
                            return state;
                          }
                          if (val > state.height.maxMax) {
                            target.classList.add('input-error');
                            return state;
                          }
                          if (val < state.height.minMin) {
                            target.classList.add('input-error');
                            return state;
                          }
                          target.classList.remove('input-error');
                          setState({ height: { ...state.height, min: val } });
                        }}
                      />
                    </div>
                    <div className={'w-1/2'}>
                      <InputContainer
                        label={'Max'}
                        value={state.height.max}
                        onInput={(event) => {
                          const target = event.target as HTMLInputElement;
                          const val = state.width.step
                            ? parseFloat(target.value)
                            : parseInt(target.value);
                          if (isNaN(val)) {
                            target.classList.add('input-error');
                            return state;
                          }
                          if (val > state.height.maxMax) {
                            target.classList.add('input-error');
                            return state;
                          }
                          if (val < state.height.minMin) {
                            target.classList.add('input-error');
                            return state;
                          }
                          target.classList.remove('input-error');
                          setState({ height: { ...state.height, max: val } });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {state.mode === 'tmpl' ? (
              <div className={'py-2'}>
                <select
                  onChange={(e) => {
                    const val = (e.target as HTMLSelectElement).value;
                    let _tmpls = [...state.templates].map((a) => {
                      return {
                        ...a,
                        active: a.label === val,
                      };
                    });
                    const tmpl = state.templates.find((a) => a.label === val);

                    setState({
                      templates: _tmpls,
                      width: {
                        ...state.width,
                        value: tmpl.value[0],
                      },
                      height: {
                        ...state.height,
                        value: tmpl.value[1],
                      },
                    });
                  }}
                  value={
                    state.templates.find((a) => a.active)?.label ??
                    state.templates[0]?.label
                  }
                  className={'select select-bordered select-xs w-full max-w-xs'}
                >
                  {state.templates.map((th) => (
                    <option key={th.label}>{th.label}</option>
                  ))}
                </select>
              </div>
            ) : null}

            {state.mode === 'cstm' ? (
              <div className={'py-2'}>
                <div className={'flex gap-x-2'}>
                  <div className={'w-1/2'}>
                    <InputContainer
                      label={'Width'}
                      value={state.width.value}
                      onInput={(event) => {
                        const target = event.target as HTMLInputElement;
                        const val = state.width.step
                          ? parseFloat(target.value)
                          : parseInt(target.value);
                        if (isNaN(val)) {
                          target.classList.add('input-error');
                          return state;
                        }
                        if (val > state.width.maxMax) {
                          target.classList.add('input-error');
                          return state;
                        }
                        if (val < state.width.minMin) {
                          target.classList.add('input-error');
                          return state;
                        }
                        target.classList.remove('input-error');
                        setState({ width: { ...state.width, value: val } });
                      }}
                    />
                  </div>
                  <div className={'w-1/2'}>
                    <InputContainer
                      label={'Height'}
                      value={state.height.value}
                      onInput={(event) => {
                        const target = event.target as HTMLInputElement;
                        const val = state.height.step
                          ? parseFloat(target.value)
                          : parseInt(target.value);
                        if (isNaN(val)) {
                          target.classList.add('input-error');
                          return state;
                        }
                        if (val > state.height.maxMax) {
                          target.classList.add('input-error');
                          return state;
                        }
                        if (val < state.height.minMin) {
                          target.classList.add('input-error');
                          return state;
                        }

                        target.classList.remove('input-error');
                        setState({ height: { ...state.height, value: val } });
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <div className={'text-xs'}>
            <h5>
              Current:{' '}
              <b>
                {state.width.value}x{state.height.value}
              </b>
            </h5>
          </div>

          <div className={'divider my-0'} />
        </main>
      );
    },
  };
};
