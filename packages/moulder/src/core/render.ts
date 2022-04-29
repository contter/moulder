import { isActive } from './utils';


export const renderNode = (node: any, activeNode: any) => {
  const doc = document.querySelector('.moulder') as HTMLElement;
  if (!doc) {
    return;
  }

  const nodeKey = `${node.pk}_${node.slug}_${node.root}`;
  const parentNodeKey = `${node.parent.pk}_${node.parent.slug}_${node.parent.root}`;

  const nd = document.querySelector(`div[data-key="${parentNodeKey}"]`);
  const block = nd ?? doc;

  const current = document.querySelector(`div[data-key="${nodeKey}"]`) as HTMLElement;
  if (current) {
    current.innerHTML = `<h2 class=' ${isActive(node, activeNode) ? 'font-bold' : ''} node__title truncate' class='font-light hover:opacity-80'>${node.name}</h2>`;
    current.dataset.pk = node.pk;
    current.dataset.slug = node.slug;
    current.dataset.root = node.root;
    current.dataset.key = nodeKey;
    current.dataset.parentKey = parentNodeKey;
    try {
      block.append(current);
    } catch (e) {
      //
    }
  } else {
    const elem = document.createElement('div');
    elem.classList.add('node', 'text-sm', 'cursor-pointer', 'pl-1', 'ml-1', 'border-l', 'border-l-base-200');
    elem.dataset.pk = node.pk;
    elem.dataset.slug = node.slug;
    elem.dataset.root = node.root;
    elem.dataset.key = nodeKey;
    elem.dataset.parentKey = parentNodeKey;
    elem.innerHTML = `<h2 class='node__title ${isActive(node, activeNode) ? 'font-bold' : ''} truncate' class='font-light hover:opacity-80'>${node.name}</h2>`;
    block.append(elem);
  }
};

export const renderParam = (element: any, node: any, slug: any) => {
  const doc = document.querySelector('.moulder') as HTMLElement;
  if (!doc) {
    return;
  }
  const exists = document.querySelector(`div[data-root="${node.root}"][data-param-slug="${slug}"][data-node-slug="${node.slug}"][data-node-pk="${node.pk}"]`);
  if (exists) {
    exists.remove();
  }
  const nodeKey = `${node.pk}_${node.slug}_${node.root}`;
  const block = document.createElement('div');
  block.classList.add('param');
  block.style.display = 'block';  // isActive(node, activeNode) ? 'block' : 'none';
  block.dataset.nodeSlug = node.slug;
  block.dataset.root = node.root;
  block.dataset.key = nodeKey;
  block.dataset.paramSlug = slug;
  block.dataset.nodePk = node.pk.toString();
  block.append(element);
  doc.append(block);
};

export const switchActive = (node: any) => {
  const key = `${node.pk}_${node.slug}_${node.root}`;
  if (node.pk < 0) {
    document.querySelectorAll('.moulder .node').forEach((doc) => {
      (doc as HTMLElement).classList.remove('active');
    });
    document.querySelectorAll('.moulder .param').forEach((doc) => {
      (doc as HTMLElement).style.display = 'none';
    });
  }
  // Check exists node other delete
  document.querySelectorAll(`.moulder .node[data-key]:not([data-key="${key}"]) > h2`).forEach((doc) => {
    (doc as HTMLElement).classList.remove('font-bold');
  });
  document.querySelectorAll(`.moulder .node[data-key="${key}"] > h2`).forEach((doc) => {
    (doc as HTMLElement).classList.add('font-bold');
  });
  document.querySelectorAll(`.moulder .param[data-key]:not([data-key="${key}"])`).forEach((doc) => {
    (doc as HTMLElement).style.display = 'none';
  });
  document.querySelectorAll(`.moulder .param[data-key="${key}"]`).forEach((doc) => {
    (doc as HTMLElement).style.display = 'block';
  });
};
