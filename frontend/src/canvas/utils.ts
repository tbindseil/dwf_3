import { Raster } from 'dwf-3-raster-tjb';

// hard to test due to issues getting canvas.getContext('2d');
export const blotRasterToCanvas = (raster: Raster, canvas: HTMLCanvasElement) => {
  if (!raster || raster.width === 0 || raster.height === 0) {
    console.log('raster width or height is 0, not updating');
    return;
  }

  const ctx = canvas!.getContext('2d');
  console.log(
    `raster.getBuffer(), raster.width, raster.height is: ${raster.getBuffer()}, ${raster.width}, ${
      raster.height
    }`,
  );
  const id = new ImageData(raster.getBuffer(), raster.width, raster.height);
  ctx!.putImageData(id, 0, 0);
};
