import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouterWrapper } from '../test_utils/memoryRouterFactory';
import { MockGlobalServices } from '../services/mock_services/mock_global_services';
import { RouterProvider } from 'react-router-dom';
import { mockCurrentPictureService } from '../services/mock_services/mock_current_picture_service';
import { Raster } from 'dwf-3-raster-tjb';
import { mockPictureService } from '../services/mock_services/mock_picture_service';

describe('Canvas tests', () => {
  let router: ReturnType<typeof createMemoryRouterWrapper>;

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
    mockCurrentPictureService.getCurrentRaster.mockReturnValue(expectedPicture);

    const width = 5;
    const height = 5;
    const currentRasterBuffer = new ArrayBuffer(width * height);
    const currentRasterBufferAsArray = new Uint8ClampedArray(currentRasterBuffer);
    for (let i = 0; i < width * height; ++i) {
      currentRasterBufferAsArray[i] = i;
    }
    const currentRaster = new Raster(width, height, currentRasterBuffer);
    mockCurrentPictureService.getCurrentRaster.mockClear();
    mockCurrentPictureService.getCurrentRaster.mockReturnValue(currentRaster);

    router = createMemoryRouterWrapper(['/picture']);
    render(
      <MockGlobalServices>
        <RouterProvider router={router} />
      </MockGlobalServices>,
    );
  });

  // TODO this shoud be its own thing maybe? Maybe more than just this one?

  // maybe 30 x a second is an implementation detail
  // and we can say that we just test that it does update...
  //
  // it('renders 30 times a second', () => {
  // this would be a heuristic... suboptimal
  // const startOfTest = performance.now();
  // wait till canvas is updated (still the crux, maybe this is reason enough that it should be its own thing)
  // const endOfTest = performance.now()
  // assert(endOfTest - startOfTest ~ 30 ms
  // ...
  // wait 1 second
  // });

  it('forwards updates to the currentPictureService', () => {
    // TODO make sure we call cps
  });

  // this essentially the check that it does update
  // because, we nevr actually explicitly have to subscribe,
  // we just draw whats given by currentPictureService
  it('receives forwarded updates from currentPictureService', () => {
    // TODO
  });

  it('updates on click', () => {
    // TODO check that cps is called
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
