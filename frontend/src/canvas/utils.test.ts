import { makeRaster } from '../test_utils/make_raster';
import { blotRasterToCanvas } from './utils';

describe('Utils tests', () => {
  const mockPutImageData = jest.fn();
  const mockContext = {
    putImageData: mockPutImageData,
  } as unknown as CanvasRenderingContext2D;

  const mockGetContext = jest.fn();
  const mockCanvas = {
    getContext: mockGetContext,
  } as unknown as HTMLCanvasElement;

  beforeEach(() => {
    mockPutImageData.mockClear();
    mockGetContext.mockClear();
    mockGetContext.mockReturnValue(mockContext);
  });

  it('does not blot when width is zero', () => {
    const zeroWidthRaster = makeRaster(0, 5);
    blotRasterToCanvas(zeroWidthRaster, mockCanvas);
    expect(mockPutImageData).toBeCalledTimes(0);
  });

  it('does not blot when height is zero', () => {
    const zeroHeightRaster = makeRaster(5, 0);
    blotRasterToCanvas(zeroHeightRaster, mockCanvas);
    expect(mockPutImageData).toBeCalledTimes(0);
  });

  it('blots', () => {
    const raster = makeRaster(6, 6);
    blotRasterToCanvas(raster, mockCanvas);
    expect(mockPutImageData).toBeCalledTimes(1);
  });
});
