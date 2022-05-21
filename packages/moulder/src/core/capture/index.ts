// TODO Build need many assets
export const capture = async (options, callback: (data: any) => any) => {
  // chunks in future
  // svg and other
  options?.beforeCapture?.();
  options.media?.forEach((m: any, i) => {

    //
    // if ('createImageBitmap' in window) {}
    if (m.capture) {
      m.capture((blob) => {
        callback({
          blob,
          mime: m.mime,
          format: m.format,
          order: i,
          count: options.media.length
        })
      });
    } else {
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
            callback({
              blob,
              mime: m.mime,
              format: m.format,
              order: i,
              count: options.media.length
            })
          },
          m.mime,
          1
        );
      }
    }
  });
};
