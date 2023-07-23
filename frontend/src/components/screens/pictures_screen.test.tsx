import { findByText, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { MockGlobalServices } from '../../services/mock_services/mock_global_services';
import { mockPictureService } from '../../services/mock_services/mock_picture_service';
import { createMemoryRouterWrapper } from '../../test_utils/memoryRouterFactory';

describe('NewPictureScreen tests', () => {
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
});
