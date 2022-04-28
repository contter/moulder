/**
 * Extra lib (use only production)
 * Capture all
 * - Asset
 * - Token with assets
 *
 * Now png
 * Future video and other
 * Chunks or stream media
 */
import { hash } from './hash';

// Capture Asset
export const captureAsset = async (options: any) => {
  // chunks in future
  // svg and other
  return new Promise((resolve, reject) => {
    options.media?.forEach((m: any) => {
      const elem = document.querySelector(`#${m.containerId}`) as HTMLCanvasElement;
      if (elem) {
        // const imageData = elem.getContext('2d').getImageData(0, 0, elem.width, elem.height);
        // const buffer = imageData.data.buffer;

        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = elem.clientWidth;
        tmpCanvas.height = elem.clientHeight;

        const ctx2 = tmpCanvas.getContext('2d');
        ctx2?.drawImage(elem, 0, 0, elem.width, elem.height, 0, 0, elem.clientWidth, elem.clientHeight);

        tmpCanvas.toBlob(
          (blob) => {
            const data = {
              blob,
              options: m.options,
              width: elem.clientWidth,
              height: elem.clientHeight,
              objWidth: elem.width,
              objHeight: elem.height
            };
            resolve(data);
          },
          m.mime,
          1
        );
      }
    });
  });
};

// TODO Build need many assets
export const captureToken = async (options: any) => {
  // chunks in future
  // svg and other
  return new Promise((resolve, reject) => {
    options.media?.forEach((m: any) => {
      const elem = document.querySelector(`#${m.containerId}`) as HTMLCanvasElement;
      if (elem) {
        // const imageData = elem.getContext('2d').getImageData(0, 0, elem.width, elem.height);
        // const buffer = imageData.data.buffer;

        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = elem.clientWidth;
        tmpCanvas.height = elem.clientHeight;

        const ctx2 = tmpCanvas.getContext('2d');
        ctx2?.drawImage(elem, 0, 0, elem.width, elem.height, 0, 0, elem.clientWidth, elem.clientHeight);

        tmpCanvas.toBlob(
          (blob) => {
            const data = {
              blob,
              options: m.options,
              width: elem.clientWidth,
              height: elem.clientHeight,
              objWidth: elem.width,
              objHeight: elem.height,
              hash: hash(),
            };
            resolve(data);
          },
          m.mime,
          1
        );
      }
    });
  });
};
