import { container } from '../wrapper';
import { createRoot } from 'react-dom/client';
import { MOULDER_ASSET_ID } from '../constants';
import { store, StoreProvider, useStore } from '../store/store';
import { observer } from 'mobx-react-lite/src/observer';
import { IMoulderNode } from '../types';
import { range } from '../utils';

interface DefaultNodeRenderProps {
  node: IMoulderNode;
  setSelect: (select: boolean) => void;
}

const DEFAULT_PADDING = 15;
let isShiftPressed = false;
let isCtrlPressed = false;

//${'' ? 'font-bold' : 'font-light'}
export const DefaultNodeRender = observer(
  ({ node, setSelect }: DefaultNodeRenderProps) => {
    return (
      <div>
        <h2
          onClick={() => {
            // setSelect(!node.selected)
          }}
        >
          {node.name}
        </h2>
      </div>
    );
  }
);
// TODO Get for overwrite

const Node = observer(({ node }: { node: IMoulderNode }) => {
  const { selection, setSelection } = useStore();
  let active = selection.find((a) => a.id === node.id);
  let colorText = 'opacity-80';
  if (node.locked) {
    colorText = 'opacity-50'; // text-white50
  }
  if (!node.visible) {
    colorText = 'opacity-30'; //text-white30
  }
  if (active) {
    colorText = ''; // text-white90
  }
  return (
    <div key={node.id}>
      <div className={'group flex relative justify-start items-center'}>
        {node.children.length ? (
          <div>
            {active ? (
              <div
                className={`w-5 h-5 flex justify-center items-center ${
                  active ? 'visible' : 'invisible'
                }`}
              >
                <svg
                  width="5"
                  height="5"
                  viewBox="0 0 5 5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="2.5"
                    cy="2.5"
                    r="2.5"
                    fill="currentColor"
                    fillOpacity="0.9"
                  />
                </svg>
              </div>
            ) : (
              <div
                onClick={() => {
                  node.setState({ collapse: !node.collapse });
                }}
                className={
                  'w-5 h-5 flex justify-center items-center cursor-pointer hover:opacity-80'
                }
              >
                {!node.collapse ? (
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 1L5 5L1 1"
                      stroke="currentColor"
                      strokeOpacity="0.7"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="6"
                    height="10"
                    viewBox="0 0 6 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1L5 5L1 9"
                      stroke="currentColor"
                      strokeOpacity="0.7"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            className={`w-5 h-5 flex justify-center items-center ${
              active ? 'visible' : 'invisible'
            }`}
          >
            <svg
              width="5"
              height="5"
              viewBox="0 0 5 5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="2.5"
                cy="2.5"
                r="2.5"
                fill="currentColor"
                fillOpacity="0.9"
              />
            </svg>
          </div>
        )}

        <div
          onClick={() => {
            if (!isCtrlPressed && !isShiftPressed) {
              setSelection([node.id]);
            }
            if (isCtrlPressed && !isShiftPressed) {
              let selects = selection.map((a) => a.id);
              if (selects.includes(node.id)) {
                selects = selects.filter((a) => a !== node.id);
              } else {
                selects.push(node.id);
              }
              setSelection(selects);
            }
            if (isShiftPressed && !isCtrlPressed) {
              const currentIndex = node.parent?.children.findIndex(
                (a) => a.id === node.id
              );
              if (currentIndex === undefined) {
                return;
              }
              const indexes = node.parent?.children
                .map((a, i) => (store.selected?.includes(a.id) ? i : -1))
                .filter((a) => a >= 0);
              let minIndex = Math.min(...(indexes as number[]));
              let maxIndex = Math.max(...(indexes as number[]));

              let idxs: number[] = [];
              if (minIndex < currentIndex) {
                idxs = range(minIndex, currentIndex);
              } else if (maxIndex > currentIndex) {
                idxs = range(currentIndex, maxIndex);
              }
              // check
              if (idxs.length) {
                const ids =
                  node.parent?.children
                    ?.filter((a, i) => idxs.includes(i))
                    .map((a) => a.id) ?? [];
                setSelection(ids);
              }
            }
          }}
          className={`text-base ${colorText} hover:opacity-80 cursor-pointer`}
        >
          <DefaultNodeRender
            node={node}
            setSelect={(select) => {
              // deselectAllNodes(MOULDER_ASSET_ID);
              // selectorNode(MOULDER_ASSET_ID, node.id, select);
            }}
          />
        </div>

        <div className={'flex absolute right-0 gap-x-2'}>
          {(node.options.get('actions') ?? []).includes('visible') ? (
            <span
              onClick={() => {
                const st = !node.visible;
                if (store.selection.length <= 1) {
                  node.setState({ visible: st });
                } else {
                  const yes = confirm(
                    'Are you sure you want to visible/invisible selected items?'
                  );
                  if (yes) {
                    store.selection
                      .filter((a) =>
                        (a.options.get('actions') ?? []).includes('visible')
                      )
                      .forEach((inNode) => {
                        inNode.setState({ visible: st });
                      });
                  }
                }
              }}
              className={`${
                !node.visible ? 'flex' : 'group-hover:visible invisible'
              } cursor-pointer hover:opacity-80`}
            >
              {node.visible ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 3.49951C3 3.49951 1 8 1 8C1 8 3 12.4995 8 12.4995C13 12.4995 15 8 15 8C15 8 13 3.49951 8 3.49951Z"
                    stroke="currentColor"
                    strokeOpacity="0.6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 10.5C9.38071 10.5 10.5 9.38071 10.5 8C10.5 6.61929 9.38071 5.5 8 5.5C6.61929 5.5 5.5 6.61929 5.5 8C5.5 9.38071 6.61929 10.5 8 10.5Z"
                    stroke="currentColor"
                    strokeOpacity="0.6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.5723 7.95654L13.9979 10.4258M9.63623 9.32892L10.0808 11.8504M6.35825 9.32776L5.91357 11.8497M3.42565 7.95453L1.99316 10.4357M2 6.55469C3.05078 7.85534 4.97713 9.49999 8.00004 9.49999C11.0229 9.49999 12.9493 7.85535 14.0001 6.5547"
                    stroke="currentColor"
                    strokeOpacity="0.3"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          ) : null}
          {(node.options.get('actions') ?? []).includes('locked') ? (
            <span
              onClick={() => {
                const st = !node.locked;
                if (store.selection.length <= 1) {
                  node.setState({ locked: st });
                } else {
                  const yes = confirm(
                    'Are you sure you want to locked/unlocked selected items?'
                  );
                  if (yes) {
                    store.selection
                      .filter((a) =>
                        (a.options.get('actions') ?? []).includes('locked')
                      )
                      .forEach((inNode) => {
                        inNode.setState({ locked: st });
                      });
                  }
                }
              }}
              className={`${
                node.locked ? 'flex' : 'group-hover:visible invisible'
              } cursor-pointer hover:opacity-80`}
            >
              {node.locked ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.9 6.23077C5.9 6.50691 6.12386 6.73077 6.4 6.73077C6.67614 6.73077 6.9 6.50691 6.9 6.23077H5.9ZM6.4 3.83515H5.9H6.4ZM8.09412 2V1.5V2ZM9.22353 2.40781L9.59092 2.06866L9.22353 2.40781ZM9.1 3.63124C9.1 3.90739 9.32386 4.13124 9.6 4.13124C9.87614 4.13124 10.1 3.90739 10.1 3.63124H9.1ZM9.1 6.23077C9.1 6.50691 9.32386 6.73077 9.6 6.73077C9.87614 6.73077 10.1 6.50691 10.1 6.23077H9.1ZM9.6 3.83515H10.1H9.6ZM7.90588 2V1.5V2ZM6.77647 2.40781L6.40908 2.06866L6.77647 2.40781ZM5.9 3.63124C5.9 3.90739 6.12386 4.13124 6.4 4.13124C6.67614 4.13124 6.9 3.90739 6.9 3.63124H5.9ZM5.6 6.73077H10.4V5.73077H5.6V6.73077ZM11.5 7.92308V11.3077H12.5V7.92308H11.5ZM10.4 12.5H5.6V13.5H10.4V12.5ZM4.5 11.3077V7.92308H3.5V11.3077H4.5ZM5.6 12.5C5.01854 12.5 4.5 11.993 4.5 11.3077H3.5C3.5 12.4917 4.41415 13.5 5.6 13.5V12.5ZM11.5 11.3077C11.5 11.993 10.9815 12.5 10.4 12.5V13.5C11.5859 13.5 12.5 12.4917 12.5 11.3077H11.5ZM10.4 6.73077C10.9815 6.73077 11.5 7.23779 11.5 7.92308H12.5C12.5 6.73909 11.5859 5.73077 10.4 5.73077V6.73077ZM5.6 5.73077C4.41415 5.73077 3.5 6.73909 3.5 7.92308H4.5C4.5 7.23779 5.01854 6.73077 5.6 6.73077V5.73077ZM6.9 6.23077V3.83515H5.9V6.23077H6.9ZM6.9 3.83515C6.9 3.46872 7.03475 3.12454 7.26358 2.87666L6.52881 2.19835C6.12223 2.63878 5.9 3.22816 5.9 3.83515H6.9ZM7.26358 2.87666C7.49118 2.63012 7.79091 2.5 8.09412 2.5V1.5C7.49871 1.5 6.93663 1.75658 6.52881 2.19835L7.26358 2.87666ZM8.09412 2.5C8.49072 2.5 8.67919 2.55529 8.85614 2.74697L9.59092 2.06866C9.13245 1.57202 8.59613 1.5 8.09412 1.5V2.5ZM8.85614 2.74697C9.03454 2.94022 9.1 3.1845 9.1 3.63124H10.1C10.1 3.10456 10.0284 2.5426 9.59092 2.06866L8.85614 2.74697ZM10.1 6.23077V3.83515H9.1V6.23077H10.1ZM10.1 3.83515C10.1 3.22816 9.87777 2.63878 9.47119 2.19835L8.73642 2.87666C8.96525 3.12454 9.1 3.46872 9.1 3.83515H10.1ZM9.47119 2.19835C9.06337 1.75658 8.50129 1.5 7.90588 1.5V2.5C8.20909 2.5 8.50882 2.63012 8.73642 2.87666L9.47119 2.19835ZM7.90588 1.5C7.40387 1.5 6.86755 1.57202 6.40908 2.06866L7.14386 2.74697C7.32081 2.55529 7.50928 2.5 7.90588 2.5V1.5ZM6.40908 2.06866C5.97156 2.5426 5.9 3.10456 5.9 3.63124H6.9C6.9 3.1845 6.96546 2.94022 7.14386 2.74697L6.40908 2.06866Z"
                    fill="currentColor"
                    fillOpacity="0.6"
                  />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.9 6.23077C5.9 6.50691 6.12386 6.73077 6.4 6.73077C6.67614 6.73077 6.9 6.50691 6.9 6.23077H5.9ZM6.4 3.83515H5.9H6.4ZM8.09412 2V1.5V2ZM9.22353 2.40781L9.59092 2.06866L9.22353 2.40781ZM9.1 3.63124C9.1 3.90739 9.32386 4.13124 9.6 4.13124C9.87614 4.13124 10.1 3.90739 10.1 3.63124H9.1ZM5.6 6.73077H10.4V5.73077H5.6V6.73077ZM11.5 7.92308V11.3077H12.5V7.92308H11.5ZM10.4 12.5H5.6V13.5H10.4V12.5ZM4.5 11.3077V7.92308H3.5V11.3077H4.5ZM5.6 12.5C5.01854 12.5 4.5 11.993 4.5 11.3077H3.5C3.5 12.4917 4.41415 13.5 5.6 13.5V12.5ZM11.5 11.3077C11.5 11.993 10.9815 12.5 10.4 12.5V13.5C11.5859 13.5 12.5 12.4917 12.5 11.3077H11.5ZM10.4 6.73077C10.9815 6.73077 11.5 7.23779 11.5 7.92308H12.5C12.5 6.73909 11.5859 5.73077 10.4 5.73077V6.73077ZM5.6 5.73077C4.41415 5.73077 3.5 6.73909 3.5 7.92308H4.5C4.5 7.23779 5.01854 6.73077 5.6 6.73077V5.73077ZM6.9 6.23077V3.83515H5.9V6.23077H6.9ZM6.9 3.83515C6.9 3.46872 7.03475 3.12454 7.26358 2.87666L6.52881 2.19835C6.12223 2.63878 5.9 3.22816 5.9 3.83515H6.9ZM7.26358 2.87666C7.49118 2.63012 7.79091 2.5 8.09412 2.5V1.5C7.49871 1.5 6.93663 1.75658 6.52881 2.19835L7.26358 2.87666ZM8.09412 2.5C8.49072 2.5 8.67919 2.55529 8.85614 2.74697L9.59092 2.06866C9.13245 1.57202 8.59613 1.5 8.09412 1.5V2.5ZM8.85614 2.74697C9.03454 2.94022 9.1 3.1845 9.1 3.63124H10.1C10.1 3.10456 10.0284 2.5426 9.59092 2.06866L8.85614 2.74697Z"
                    fill="currentColor"
                    fillOpacity="0.9"
                  />
                </svg>
              )}
            </span>
          ) : null}
          {(node.options.get('actions') ?? []).includes('deleted') ? (
            <span
              onClick={() => {
                // TODO Confirm?
                if (store.selection.length <= 1) {
                  node.remove();
                } else {
                  const yes = confirm(
                    'Are you sure you want to delete selected items?'
                  );
                  if (yes) {
                    store.selection
                      .filter((a) =>
                        (a.options.get('actions') ?? []).includes('deleted')
                      )
                      .forEach((node) => {
                        node.remove();
                      });
                    setSelection([]);
                  }
                }
              }}
              className={
                'group-hover:visible invisible cursor-pointer hover:opacity-80'
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.5 3.5L2.5 3.5M6 6.5V11.5M10 6.5V11.5M10.5005 3.5V2.5C10.5005 2.23478 10.3951 1.98043 10.2076 1.79289C10.0201 1.60536 9.7657 1.5 9.50049 1.5H6.50049C6.23527 1.5 5.98092 1.60536 5.79338 1.79289C5.60585 1.98043 5.50049 2.23478 5.50049 2.5V3.5M5.00049 14H11.0005C12.1051 14 13.0005 13.1046 13.0005 12V6C13.0005 4.89543 12.1051 4 11.0005 4H5.00049C3.89592 4 3.00049 4.89543 3.00049 6V12C3.00049 13.1046 3.89592 14 5.00049 14Z"
                  stroke="currentColor"
                  strokeOpacity="0.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          ) : null}
        </div>
      </div>
      <div>
        {/*{node.state.collapse ? 'hide' : 'show'}*/}
        {!node.collapse && node.children.length ? (
          <Nodes key={node.children.length} nodes={node.children} />
        ) : null}
      </div>
    </div>
  );
});

const Nodes = observer(({ nodes }: { nodes: IMoulderNode[] }) => {
  return (
    <div style={{ paddingLeft: `${DEFAULT_PADDING}px` }}>
      {nodes.map((node) => (
        <Node key={`${MOULDER_ASSET_ID}_${node.id}`} node={node} />
      ))}
    </div>
  );
});

const Main = observer(() => {
  const store = useStore();

  return (
    <div className={'select-none'}>
      <div
        onClick={() => {
          store.setSelection([store.node.id]);
        }}
        className={`flex items-center text-base ${
          store.selection.find((a) => a.id === store.node.id)
            ? ''
            : 'opacity-70'
        } hover:opacity-80 cursor-pointer`}
      >
        <div
          className={`w-5 h-5 flex justify-center items-center ${
            store.selection.find((a) => a.id === store.node.id)
              ? 'visible'
              : 'invisible'
          }`}
        >
          <svg
            width="5"
            height="5"
            viewBox="0 0 5 5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="2.5"
              cy="2.5"
              r="2.5"
              fill="currentColor"
              fillOpacity="0.9"
            />
          </svg>
        </div>
        <h2>{store.name ?? 'Root'}</h2>
      </div>
      <Nodes key={store.node.children.length} nodes={store.node.children} />
    </div>
  );
});

export const runNode = () => {
  const root = createRoot(container);
  root.render(
    <StoreProvider value={store}>
      <Main />
    </StoreProvider>
  );
};

const defaultNodeSelection = () => {
  document.addEventListener('keyup', (ev) => {
    isShiftPressed = false;
    isCtrlPressed = false;
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Shift') {
      isShiftPressed = true;
    }
    if (ev.key === 'Meta' || ev.ctrlKey) {
      // check mac or windows ctrl
      isCtrlPressed = true;
    }
  });
};

defaultNodeSelection();
