import { FormEvent } from 'react';

type TTabContainerProps = {
  navs: any[];
  mode: string;
  onChange: (mode: string) => void;
};

export const TabContainer = (props: TTabContainerProps) => {
  return (
    <div className={'tabs my-0.5 tabs-boxed w-full'}>
      {props.navs.map((nav) => (
        <a
          key={nav.key}
          style={{
            width: `${100 / props.navs.length}%`,
          }}
          onClick={() => {
            props.onChange(nav.key);
          }}
          className={`tab tab-xs ${nav.key === props.mode ? 'tab-active' : ''}`}
        >
          {nav.title}
        </a>
      ))}
    </div>
  );
};

type TInputContainerProps = {
  label: string;
  value: string | number;
  onInput: (e: FormEvent<HTMLInputElement>) => void;
  inputOptions?: any;
};

export const InputContainer = (props: TInputContainerProps) => {
  return (
    <div className={'form-control'}>
      <label className={'input-group input-group-xs'}>
        <span className={'px-1'}>{props.label}</span>
        <input
          className={
            'input appearance-none input-bordered text-xs input-xs w-full'
          }
          defaultValue={props.value}
          type={props.inputOptions?.type ?? 'number'}
          onInput={props.onInput}
          {...(props.inputOptions ?? {})}
        />
      </label>
    </div>
  );
};
