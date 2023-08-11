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

  it('blots', () => {
    const raster = makeRaster(6, 6);
    blotRasterToCanvas(raster, mockCanvas);
    expect(mockPutImageData).toBeCalledTimes(1);
  });
});
