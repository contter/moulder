# Moulder

### 🚧  Beta version 🚧

### Moulder - A JavaScript framework for building visual artworks.

## Features

- Using any js library (p5js, threejs, etc).
- Editor based on nodes and properties.
- Customizable components.
- Flexible properties.
- Easy to use.

## Install

```
npm i moulder
// or
yarn add moulder
```

## Usage
```js
// Example with p5js
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
# Run
```
npm run dev
# Go to localhost:3000?editor=1&dev=1
# It's open an editor
```

# Starter Kits

### p5js - Typescript
https://github.com/contter/moulder-starter-p5js-ts

### p5js - Ecmascript
https://github.com/contter/moulder-starter-p5js

## TODO

- 100% typescript coverage.
- Add test runs.
- Documentation on component's creation.

### Contributors ✨

Open for cooperation

## License

MIT License

