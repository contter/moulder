import p5 from 'p5';
import { random, registerAsset } from 'moulder';

const asset = (node: any) => {
  // console.log('ASSET:::', node);
  const width = window.innerWidth;
  const height = window.innerHeight;

  const bg = node.useParameter({ title: 'Background', helper: 'color', mode: 'rnd' });

  const palette = [
    { value: ["#ffbc42","#d81159","#8f2d56","#218380","#73d2de"] },
    { value: ["#ff8811","#f4d06f","#fff8f0","#9dd9d2","#392f5a"] },
    { value: ["#00fddc","#2e5339","#495f41","#ff5666","#ffccc9"] },
    { value: ["#820263","#d90368","#eadeda","#2e294e","#ffd400"] }
  ]
  const resPalette = node.useParameter({ helper: 'palette', title: 'Palette', array: palette })[0].sort((a: any, b: any) => a - b);
  const isNoise = node.useParameter({ title: 'Noise', helper: 'boolean', mode: 'rnd' });
  const noiseInt = node.useParameter({ helper: 'between', title: 'Noise volume', min: 0, max: 22, minMin: 0, maxMax: 50  });

  const items: any = [];
  const r_nodes = node.useNodes({ name: 'Rectangle', title: 'Rectangle', helper: 'between', min: 0, max: 4, maxMax: 10 });
  r_nodes.forEach((nodeRectangle: any) => {
    const rotation = nodeRectangle.useParameter({ helper: 'between', title: 'Rotation', min: 0, max: 360 });
    const spreadX = nodeRectangle.useParameter({ helper: 'between', title: 'Spread X', min: -150, max: 150, minMin: -500, maxMax: 500  });
    const spreadY = nodeRectangle.useParameter({ helper: 'between', title: 'Spread Y', min: -150, max: 150, minMin: -500, maxMax: 500  });
    const x = (width / 2) + spreadX;
    const y = (height / 2) + spreadY;
    const w = nodeRectangle.useParameter({ helper: 'between', title: 'Width', min: 0, max: 150, minMin: 0, maxMax: 300 });
    const h = nodeRectangle.useParameter({ helper: 'between', title: 'Height', min: 0, max: 150, minMin: 0, maxMax: 300 });
    const fill = [...resPalette].sort(() => 0.5 - random().random())[0];
    items.push({
      type: 'rectangle',
      fill,
      rotation,
      x,
      y,
      width: w,
      height: h
    });
  })

  const t_nodes = node.useNodes({ name: 'Triangle', title: 'Count triangles', helper: 'between', min: 2, max: 4 });
  t_nodes.forEach((nodeTriangle: any) => {
    const rotation = nodeTriangle.useParameter({ helper: 'between', title: 'Rotation', min: 0, max: 360 });
    const spreadX = nodeTriangle.useParameter({ helper: 'between', title: 'Spread X', min: -150, max: 150, minMin: -500, maxMax: 500  });
    const spreadY = nodeTriangle.useParameter({ helper: 'between', title: 'Spread Y', min: -150, max: 150, minMin: -500, maxMax: 500  });
    const x = (width / 2) + spreadX;
    const y = (height / 2) + spreadY;
    const radius = nodeTriangle.useParameter({ helper: 'between', title: 'Radius', min: 0, max: 150 });
    const fill = [...resPalette].sort(() => 0.5 - random().random())[0];
    items.push({
      type: 'triangle',
      fill,
      rotation,
      x,
      y,
      radius
    });
  })

  const c_nodes = node.useNodes({ name: 'Circle',  title: 'Count circles', helper: 'between', min: 2, max: 4 });
  c_nodes.forEach((nodeCircle: any) => {
    const rotation = nodeCircle.useParameter({ helper: 'between', title: 'Rotation', min: 0, max: 360 });
    const spreadX = nodeCircle.useParameter({ helper: 'between', title: 'Spread X', min: -150, max: 150, minMin: -500, maxMax: 500  });
    const spreadY = nodeCircle.useParameter({ helper: 'between', title: 'Spread Y', min: -150, max: 150, minMin: -500, maxMax: 500  });
    const x = (width / 2) + spreadX;
    const y = (height / 2) + spreadY;
    const radius = nodeCircle.useParameter({ helper: 'between', title: 'Radius', min: 0, max: 150 });
    const fill = [...resPalette].sort(() => 0.5 - random().random())[0];
    items.push({
      type: 'circle',
      fill,
      rotation,
      x,
      y,
      radius
    });
  })

  const l_nodes = node.useNodes({ name: 'Line', title: 'Count lines', helper: 'between', min: 2, max: 4, maxMax: 100 });
  l_nodes.forEach((nodeLine: any) => {
    const rotation = nodeLine.useParameter({ helper: 'between', title: 'Rotation', min: 0, max: 360 });
    const spreadX = nodeLine.useParameter({ helper: 'between', title: 'Spread X', min: -150, max: 150, minMin: -500, maxMax: 500  });
    const spreadY = nodeLine.useParameter({ helper: 'between', title: 'Spread Y', min: -150, max: 150, minMin: -500, maxMax: 500  });
    const x = (width / 2) + spreadX;
    const y = (height / 2) + spreadY;
    const length = nodeLine.useParameter({ helper: 'between', title: 'Length', min: 0, max: 200 });
    const weight = nodeLine.useParameter({ helper: 'between', title: 'Weight', min: 0, max: 20 });
    const fill = [...resPalette].filter(a => a !== bg).sort(() => 0.5 - random().random())[0];
    items.push({
      type: 'line',
      fill,
      rotation,
      x,
      y,
      length,
      weight,
    });
  });

  let sketch = function(p5: any) {

    p5.setup = () => {
      p5.createCanvas(width, height);
      p5.rectMode(p5.CENTER);
      p5.ellipseMode(p5.CENTER);
    }

    p5.draw = () => {
      p5.background(bg);

      // Render
      // TODO Check correct
      items.sort(() => 0.5 - random().random()).forEach((item: any) => {
        p5.push();
        if (item.type === 'rectangle') {
          p5.noStroke();
          p5.fill(item.fill);
          p5.translate(item.x - (item.width / 2), item.y - (item.height / 2));
          p5.rotate(item.rotation * Math.PI / 180);
          p5.rect(0, 0, item.width, item.height);
        }
        if (item.type === 'triangle') {
          p5.noStroke();
          p5.fill(item.fill);
          p5.translate(item.x + (item.radius / 2), item.y + (item.radius / 2));
          p5.rotate(item.rotation * Math.PI / 180);
          // p5.rect(0, 0, item.width, item.height);
          p5.triangle(
            0, -(item.radius/2),
            item.radius/2, item.radius/2,
            -(item.radius/2), item.radius/2
          );
        }
        if (item.type === 'circle') {
          p5.noStroke();
          p5.fill(item.fill);
          p5.translate(item.x + (item.radius / 2), item.y + (item.radius / 2));
          p5.rotate(item.rotation * Math.PI / 180);
          p5.circle(0, 0, item.radius);
        }
        if (item.type === 'line') {
          p5.noFill();
          p5.stroke(item.fill);
          p5.translate(item.x, item.y);
          p5.rotate(item.rotation * Math.PI / 180);
          p5.strokeWeight(item.weight);
          p5.strokeCap(p5.SQUARE);
          p5.line(0, 0, item.length, item.length);
        }
        p5.pop();
      });

      // // Noise
      if (isNoise) {
        p5.loadPixels();
        let d = p5.pixelDensity();
        const noise = noiseInt;//p5.random(12, 27);
        let aImage = 4 * (width * d) * (height * d);
        for (let i = 0; i < aImage; i += 4) {
          p5.pixels[i] = p5.random(p5.pixels[i]-noise, p5.pixels[i]+noise);
          p5.pixels[i + 1] = p5.random(p5.pixels[i + 1]-noise, p5.pixels[i + 1]+noise);
          p5.pixels[i + 2] = p5.random(p5.pixels[i + 2]-noise, p5.pixels[i + 2]+noise);
          // p5.pixels[i + 3] = alpha(pink);
        }
        p5.updatePixels();
      }

      p5.noLoop();
    }
  }

  new p5(sketch, document.body);
}

registerAsset((node: any) => {
  asset(node);
}, {
  media: [ // capture
    {
      containerId: 'defaultCanvas0',
      format: 'png',
      mime: 'image/png'
    }
  ]
});
