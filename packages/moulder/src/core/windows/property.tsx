import { container } from '../wrapper';
import { createRoot } from 'react-dom/client';
import { useMemo } from 'react';
import { components } from '../components';
import { store, StoreProvider, useStore } from '../store/store';
import { observer } from 'mobx-react-lite/src/observer';
import { IMoulderProperty } from '../types';
import { deepCopy, groupBy } from '../utils';

const Property = observer(({ prop }: { prop: IMoulderProperty }) => {
  const comp = components[prop.component];
  return (
    <div>
      {comp.render(deepCopy(prop), (state) => {
        prop.change(state);
      })}
    </div>
  );
});

const PropertyMixin = observer(({ props }: { props: IMoulderProperty[] }) => {
  const comp = components[props[0].component];
  return (
    <div>
      <h5 className={'px-1 text-xs'}>Mixed ({props.length} properties)</h5>
      {comp.render(deepCopy(props[0]), (state) => {
        props.forEach((prop) => {
          prop.change({ ...deepCopy(props[0]).state, ...state });
        });
      })}
    </div>
  );
});

const Inner = observer(() => {
  const store = useStore();

  const groupByParent: any = useMemo(() => {
    let ids: string[] = [];
    const selection: any = [];
    store.selection.slice().forEach((a) => {
      if (!ids.includes(a.id)) {
        ids.push(a.id);
        selection.push(a);
      }
    });
    const groupByParent = groupBy(selection, (a: any) => `${a.parent?.id}`);

    Object.keys(groupByParent).forEach((key) => {
      const props: any = [];
      groupByParent[key].forEach((item) => {
        props.push(item.properties);
      });
      const groupProps = groupBy(props.flat(), (a: any) => a.id);
      groupByParent[key] = [
        [groupByParent[key]],
        [Object.keys(groupProps).map((k) => groupProps[k])],
      ];
    });

    return groupByParent;
  }, [store.selection.slice()]);

  return (
    <div>
      {Object.entries(groupByParent).map((entry: any) => (
        <div key={entry[0]}>
          {entry[1][1].map((_items) => (
            <div key={_items.length}>
              {_items.map((items) => {
                if (items[0].options.ignore) {
                  return <div key={items[0].id} />;
                }
                if (items.length > 1) {
                  const locked = items.every((a) => a.node.locked);
                  return (
                    <div
                      className={`${
                        locked
                          ? 'select-none pointer-events-none cursor-not-allowed'
                          : ''
                      }`}
                      key={items[0].id}
                    >
                      <PropertyMixin props={items} />
                    </div>
                  );
                }
                return (
                  <div
                    className={`${
                      items[0].node.locked
                        ? 'select-none pointer-events-none cursor-not-allowed'
                        : ''
                    }`}
                    key={items[0].id}
                  >
                    <Property prop={items[0]} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});

const Main = observer(() => {
  return (
    <div>
      <Inner />
    </div>
  );
});

export const runProperty = () => {
  const root = createRoot(container);
  root.render(
    <StoreProvider value={store}>
      <Main />
    </StoreProvider>
  );
};
