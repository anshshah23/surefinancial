// Minimal canvas shim used only to satisfy optional imports by pdfjs-dist during server build.
// This shim does not provide real rendering and is only intended to avoid module-not-found errors.
module.exports = {
  createCanvas: function (w, h) {
    return {
      width: w,
      height: h,
      getContext: function () {
        return {
          // minimal noop context
          fillRect: () => {},
          getImageData: () => ({ data: new Uint8ClampedArray(w * h * 4) }),
          putImageData: () => {},
          createImageData: () => ({ data: new Uint8ClampedArray(w * h * 4) }),
        };
      },
    };
  },
};
