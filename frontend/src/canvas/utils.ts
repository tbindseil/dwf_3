import { Raster } from 'dwf-3-raster-tjb';

// hard to test due to issues getting canvas.getContext('2d');
export const blotRasterToCanvas = (raster: Raster, canvas: HTMLCanvasElement) => {
  const ctx = canvas!.getContext('2d');
  const id = new ImageData(raster.getBuffer(), raster.width, raster.height);
  ctx!.putImageData(id, 0, 0);
};
