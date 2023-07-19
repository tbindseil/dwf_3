import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { MockGlobalServices } from '../../services/mock_services/mock_global_services';
import { mockPictureService } from '../../services/mock_services/mock_picture_service';
import { createMemoryRouterWrapper } from '../../test_utils/memoryRouterFactory';

describe('HomeScreen tests', () => {
  let router: ReturnType<typeof createMemoryRouterWrapper>;

  beforeEach(() => {
    mockPictureService.getPictures.mockClear();
    mockPictureService.getPictures.mockImplementation(() => {
      console.log('@@ TJTAG @@ mock impl');
      return new Promise((value: unknown) => {
        return { pictures: [] };
      });
    });
    router = createMemoryRouterWrapper(['/']);

    render(
      <MockGlobalServices>
        <RouterProvider router={router} />
      </MockGlobalServices>,
    );
  });

  it('is defined at the right path', () => {
    expect(router.state.location.pathname).toEqual('/');
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
