import { getLoadFunc } from '../register';
import { container } from '../wrapper';
import { createRoot } from 'react-dom/client';
import { useEffect } from 'react';
import { store, StoreProvider, useStore } from '../store/store';
import { observer } from 'mobx-react-lite/src/observer';
import { regenerateRandom } from '../random';

const clear = () => {
  document.body.childNodes.forEach((node) => {
    if ((node as HTMLElement).id !== container.id) {
      node.remove();
    }
  });
};

// Asset Window
const Main = observer(() => {
  const store = useStore();

  useEffect(() => {
    if (store.hash || store.rnd) {
      if (store.hash) {
        regenerateRandom(store.hash);
        clear();
        getLoadFunc()(store);
      }
    }
  }, [store.hash, store.rnd]);

  return <div style={{ width: '100%', height: '100%' }} />;
});

export const runAsset = () => {
  container.style.display = 'none';

  const root = createRoot(container);
  root.render(
    <StoreProvider value={store}>
      <Main />
    </StoreProvider>
  );
};
