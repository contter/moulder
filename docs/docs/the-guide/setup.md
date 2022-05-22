---
sidebar_position: 1
---

# Setup

You can also use [starter-kits](/) or use the instructions below.

## Install

```bash npm2yarn
npm install moulder
```

## Init

  1. Create a directory ```src```.
  2. Create a file ```index.js``` or ```index.ts```.

## Usage

```js
import p5 from 'p5';
import { random, registerAsset } from 'moulder';

let p5Global;
const asset = (moulder) => {
  const bg = moulder.node.useProperty('color', 'Background', { mode: 'rnd' });

  p5Global?.remove?.();
  let sketch = (p5) => {
    p5Global = p5;

    p5.setup = () => {
      p5.createCanvas(window.innerWidth, window.innerHeight);
    }

    p5.draw = () => {
      p5.background(bg);

      p5.noLoop();
    }
  }

  new p5(sketch, document.body);
};

registerAsset((node) => {
  asset(node);
}, {
  prepareState: (node) => {
    // TODO Setup unique state
    return {};
  },
  beforeCapture: () => {
    // Optional
  },
  media: [
    {
      containerId: 'defaultCanvas0',
      format: 'png',
      mime: 'image/png'
    }
  ]
});
```

## Run
```bash
npm run dev
# Go to localhost:3000?editor=1&dev=1
# It's open an editor
```
