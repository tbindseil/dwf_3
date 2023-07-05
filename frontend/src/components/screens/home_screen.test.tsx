import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { createMemoryRouterWrapper } from '../../test_utils/memoryRouterFactory';

describe('HomeScreen tests', () => {
  let router: ReturnType<typeof createMemoryRouterWrapper>;

  beforeEach(() => {
    router = createMemoryRouterWrapper(['/']);

    render(<RouterProvider router={router} />);
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
