import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { HomeScreen } from './home_screen';
import { NewPictureScreen } from './new_picture_screen';
import { PicturesScreen } from './pictures_screen';

describe('HomeScreen tests', () => {
  let router: ReturnType<typeof createMemoryRouter>;

  beforeEach(() => {
    // seems like this could be defined once as a utility and
    // parameterized with the initialEntries
    router = createMemoryRouter(
      [
        {
          path: '/',
          element: <HomeScreen />,
        },
        {
          path: '/new-picture',
          element: <NewPictureScreen />,
        },
        {
          path: '/pictures',
          element: <PicturesScreen />,
        },
      ],
      {
        initialEntries: ['/'],
      },
    );

    render(<RouterProvider router={router} />);
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

    expect(router.state.location.pathname).toEqual('/');

    fireEvent.click(newPictureButton);

    await waitFor(() => {
      expect(router.state.location.pathname).toEqual('/new-picture');
    });
  });
});
