export const generateHash = () => {
  const chars = 'abcdefABCDEF0123456789';
  let result = 'x01'; // version
  for (let i = 52; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

class Random {
  crypt: any;
  hash: string;

  constructor(initHash: string) {
    const crypt = parseInt(initHash.slice(3, 16), 16);
    this.crypt = `0x${crypt}`;
    this.hash = initHash;
  }

  protected rnd() {
    /* tslint:disable:no-bitwise */
    this.crypt ^= this.crypt << 13;
    this.crypt ^= this.crypt >> 17;
    this.crypt ^= this.crypt << 5;
    return ((this.crypt < 0 ? ~this.crypt + 1 : this.crypt) % 10000000) / 10000000;
    /* tslint:enable:no-bitwise */
  }

  random = () => {
    return this.rnd();
  };

  between = (a: number, b: number): number => {
    return a + (b - a) * this.rnd();
  };

  betweenInt = (a: number, b: number): number => {
    return Math.floor(this.between(a, b + 1));
  };

  choice = (x: any[]) => {
    return x[Math.floor(this.between(0, x.length * 0.99))];
  };

  choiceWeights = (w: any[]) => {
    const l = w.length;
    const topsum = new Array(l);
    let sum = 0;
    for (let i = 0; i < l; i++) {
      sum += w[i][1];
      topsum[i] = sum;
    }
    for (let i = 0; i < l; i++) {
      topsum[i] /= sum;
    }

    const n = 1;
    const arr = new Array(n);
    for (let i = 0; i < n; i++) {
      const y = this.rnd();
      let j = 0;
      while (y > topsum[j] && j < l - 1) {
        j += 1;
      }
      arr[i] = w[j][0];
    }
    return arr[0];
  };
}

// use query or exists data;
let initialHash = new URLSearchParams(window.location.search).get('hash');
if (!initialHash) {
  initialHash = generateHash();
}
export const hash = (): string => {
  return initialHash as string;
};

let initialRandom = new Random(hash());
export let regenerateRandom = (newHash: string) => {
  initialHash = newHash;
  initialRandom = new Random(initialHash);
};
export const random = () => {
  return initialRandom;
};
//
// const uid = () => {
//   return String.fromCharCode(Math.floor(random.random() * 26) + 97)
//     + random.random().toString(16).slice(2)
//     + performance.now().toString(16).slice(4);
// };
export const uid = (): string => {
  const a = new Uint32Array(3);
  window.crypto.getRandomValues(a);
  return (
    performance.now().toString(36) +
    Array.from(a)
      .map((A) => A.toString(36))
      .join('')
  ).replace(/\./g, '');
};
