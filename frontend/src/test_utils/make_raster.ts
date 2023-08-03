import { Raster } from 'dwf-3-raster-tjb';

export const makeRaster = (width: number, height: number, start: number = 0): Raster => {
  const currentRasterBuffer = new ArrayBuffer(width * height * 4);
  const currentRasterBufferAsArray = new Uint8ClampedArray(currentRasterBuffer);
  for (let i = 0; i < width * height * 4; ++i) {
    currentRasterBufferAsArray[i] = start + i;
  }
  return new Raster(width, height, currentRasterBuffer);
};
