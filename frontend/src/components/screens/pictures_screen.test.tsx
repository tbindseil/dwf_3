import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { mockCurrentPictureService } from '../../services/mock_services/mock_current_picture_service';
import { MockGlobalServices } from '../../services/mock_services/mock_global_services';
import { mockPictureService } from '../../services/mock_services/mock_picture_service';
import { createMemoryRouterWrapper } from '../../test_utils/memoryRouterFactory';

describe('PicturesScreen tests', () => {
  let router: ReturnType<typeof createMemoryRouterWrapper>;
  const expectedPicture = {
    id: 1,
    name: 'name1',
    createdBy: 'createdBy1',
    filename: 'filename1',
    filesystem: 'filesystem',
  };

  beforeEach(() => {
    mockPictureService.getPictures.mockClear();
    mockPictureService.getPictures.mockResolvedValue({ pictures: [expectedPicture] });

    mockCurrentPictureService.setCurrentPicture.mockClear();

    router = createMemoryRouterWrapper(['/pictures']);
    render(
      <MockGlobalServices>
        <RouterProvider router={router} />
      </MockGlobalServices>,
    );
  });

  it('is defined at the right path', () => {
    expect(router.state.location.pathname).toEqual('/pictures');
  });

  it('lists each picture as a button', async () => {
    await waitFor(() => {
      const pButton = screen.getByText(/by/);
      expect(pButton).toBeInTheDocument();
    });
  });

  it('goes to canvas page after clicking picture button', async () => {
    // getting an initial reference to satisfy compiler, it doesn't know the code in
    // waitFor's callback is garuanteed to run
    let pButton: Element = screen.getByText(/Pic/);
    await waitFor(() => {
      pButton = screen.getByText(/by/);
      expect(pButton).toBeInTheDocument();
    });

    fireEvent.click(pButton);

    await waitFor(() => {
      expect(mockCurrentPictureService.setCurrentPicture).toHaveBeenCalledWith(expectedPicture);
      expect(router.state.location.pathname).toEqual('/picture');
    });
  });
});
