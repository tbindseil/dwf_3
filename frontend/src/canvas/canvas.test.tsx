import { fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react';
import { createMemoryRouterWrapper } from '../test_utils/memoryRouterFactory';
import { MockGlobalServices } from '../services/mock_services/mock_global_services';
import { RouterProvider } from 'react-router-dom';
import { mockCurrentPictureService } from '../services/mock_services/mock_current_picture_service';
import { Raster } from 'dwf-3-raster-tjb';
import { mockPictureService } from '../services/mock_services/mock_picture_service';

import { blotRasterToCanvas } from './utils';
jest.mock('./utils.ts');
const mockBlotRasterToCanvas = jest.mocked(blotRasterToCanvas, true);

describe('Canvas tests', () => {
  let router: ReturnType<typeof createMemoryRouterWrapper>;
  let renerResult: RenderResult;
  let currentRaster: Raster;

  const makeRaster = (width: number, height: number, start: number = 0): Raster => {
    const currentRasterBuffer = new ArrayBuffer(width * height * 4);
    const currentRasterBufferAsArray = new Uint8ClampedArray(currentRasterBuffer);
    for (let i = 0; i < width * height * 4; ++i) {
      currentRasterBufferAsArray[i] = start + i;
    }
    return new Raster(width, height, currentRasterBuffer);
  };

  beforeEach(() => {
    const expectedPicture = {
      id: 1,
      name: 'name1',
      createdBy: 'createdBy1',
      filename: 'filename1',
      filesystem: 'filesystem',
    };
    mockPictureService.getPictures.mockClear();
    mockPictureService.getPictures.mockResolvedValue({ pictures: [expectedPicture] });

    mockCurrentPictureService.getCurrentPicture.mockClear();
    mockCurrentPictureService.getCurrentPicture.mockReturnValue(expectedPicture);

    mockCurrentPictureService.handleUserUpdate.mockClear();

    currentRaster = makeRaster(6, 6);
    mockCurrentPictureService.getCurrentRaster.mockClear();
    mockCurrentPictureService.getCurrentRaster.mockReturnValue(currentRaster);

    router = createMemoryRouterWrapper(['/picture']);
    renerResult = render(
      <MockGlobalServices>
        <RouterProvider router={router} />
      </MockGlobalServices>,
    );
  });

  it('periodically asks cps for the raster', async () => {
    await waitFor(() => {
      expect(mockBlotRasterToCanvas).toBeCalledWith(currentRaster, expect.any(HTMLCanvasElement));
    });

    const newRaster = makeRaster(6, 6, 7);
    // how is this not a race condition?
    mockCurrentPictureService.getCurrentRaster.mockClear();
    mockCurrentPictureService.getCurrentRaster.mockReturnValue(newRaster);

    await waitFor(() => {
      expect(mockBlotRasterToCanvas).toBeCalledWith(newRaster, expect.any(HTMLCanvasElement));
    });
  });

  it('forwards updates to the currentPictureService', async () => {
    const canvas = renerResult.container.querySelector('#canvas');
    expect(canvas).toBeInTheDocument();

    if (canvas === null) {
      throw Error('no canvas!');
    }

    fireEvent.click(canvas);

    await waitFor(() => {
      expect(mockCurrentPictureService.handleUserUpdate).toBeCalled();
    });
  });

  it('renders PicturesScreen button', async () => {
    const picturesButton = screen.getByText('Pictures');
    expect(picturesButton).toBeInTheDocument();

    fireEvent.click(picturesButton);

    await waitFor(() => {
      expect(router.state.location.pathname).toEqual('/pictures');
    });
  });

  it('renders NewPictureScreen button', async () => {
    const newPictureButton = screen.getByText('New Picture');
    expect(newPictureButton).toBeInTheDocument();

    fireEvent.click(newPictureButton);

    await waitFor(() => {
      expect(router.state.location.pathname).toEqual('/new-picture');
    });
  });
});
