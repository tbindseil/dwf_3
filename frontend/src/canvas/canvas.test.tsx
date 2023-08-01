import { fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react';
import { createMemoryRouterWrapper } from '../test_utils/memoryRouterFactory';
import { MockGlobalServices } from '../services/mock_services/mock_global_services';
import { RouterProvider } from 'react-router-dom';
import { mockCurrentPictureService } from '../services/mock_services/mock_current_picture_service';
import { Raster } from 'dwf-3-raster-tjb';
import { mockPictureService } from '../services/mock_services/mock_picture_service';

describe('Canvas tests', () => {
  let router: ReturnType<typeof createMemoryRouterWrapper>;
  let renerResult: RenderResult;
  let currentRaster: Raster;

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

    const width = 6;
    const height = 6;
    const currentRasterBuffer = new ArrayBuffer(width * height * 4);
    const currentRasterBufferAsArray = new Uint8ClampedArray(currentRasterBuffer);
    for (let i = 0; i < width * height * 4; ++i) {
      currentRasterBufferAsArray[i] = i;
    }
    currentRaster = new Raster(width, height, currentRasterBuffer);
    mockCurrentPictureService.getCurrentRaster.mockClear();
    mockCurrentPictureService.getCurrentRaster.mockReturnValue(currentRaster);

    router = createMemoryRouterWrapper(['/picture']);
    renerResult = render(
      <MockGlobalServices>
        <RouterProvider router={router} />
      </MockGlobalServices>,
    );
  });

  it.only('periodically asks cps for the raster', async () => {
    await waitFor(() => {
      expect(mockCurrentPictureService.getCurrentRaster).toBeCalledWith(
        currentRaster.getBuffer(),
        currentRaster.width,
        currentRaster.height,
      );
    });

    // adjust currentRaster and wait again
    // might need to be serialized - naw, setup the mock to return something new, not sure that will work either..

    await waitFor(() => {
      expect(mockCurrentPictureService.getCurrentRaster).toBeCalledWith(
        currentRaster.getBuffer(),
        currentRaster.width,
        currentRaster.height,
      );
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
