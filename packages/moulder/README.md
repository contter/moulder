# Moulder

### 🚧  Beta version 🚧

### Moulder - A JavaScript framework for building visual artworks.

## Features

- Using any js library (p5js, threejs, etc).
- Editor based on nodes and parameters.
- Customizable tools.
- Flexible parameters.
- Easy to use.

## Install

```
npm i moulder
```

## Usage
```js
// Example with p5js
import p5 from 'p5';
import { random, registerAsset } from 'moulder';

const asset = (node) => {
  const bg = node.useParameter({ title: 'Background', helper: 'color', mode: 'rnd' });

  let sketch = (p5) => {

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


## TODO

- Ability to use custom hash.
- 100% typescript coverage.
- Add test runs.
- Documentation on tool creation.

### Contributors ✨

Open for cooperation

## License

MIT License

