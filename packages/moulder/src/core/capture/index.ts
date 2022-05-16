// TODO Build need many assets
export const capture = async (options) => {
  // chunks in future
  // svg and other
  options?.beforeCapture?.();
  return new Promise((resolve, reject) => {
    options.media?.forEach((m: any) => {
      // TODO check custom render

      //
      // if ('createImageBitmap' in window) {}

      const elem = document.querySelector(
        `#${m.containerId}`
      ) as HTMLCanvasElement;
      if (elem) {
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = elem.clientWidth;
        tmpCanvas.height = elem.clientHeight;

        const ctx2 = tmpCanvas.getContext('2d');
        ctx2?.drawImage(
          elem,
          0,
          0,
          elem.width,
          elem.height,
          0,
          0,
          elem.clientWidth,
          elem.clientHeight
        );

        tmpCanvas.toBlob(
          (blob) => {
            resolve({
              blob,
              mime: m.mime,
              format: m.format,
            });
          },
          m.mime,
          1
        );
      }
    });
  });
};
