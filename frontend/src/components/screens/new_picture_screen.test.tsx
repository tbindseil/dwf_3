import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { MockGlobalServices } from '../../services/mock_global_services';
import { createMemoryRouterWrapper } from '../../test_utils/memoryRouterFactory';

describe('NewPictureScreen tests', () => {
  let router: ReturnType<typeof createMemoryRouterWrapper>;

  beforeEach(() => {
    router = createMemoryRouterWrapper(['/new-picture']);

    render(
      <MockGlobalServices>
        <RouterProvider router={router} />
      </MockGlobalServices>,
    );
  });

  it('is defined at the right path', () => {
    expect(router.state.location.pathname).toEqual('/new-picture');
  });

  it('renders PicturesScreen button', async () => {
    const picturesButton = screen.getByText('Pictures');
    expect(picturesButton).toBeInTheDocument();

    fireEvent.click(picturesButton);

    await waitFor(() => {
      expect(router.state.location.pathname).toEqual('/pictures');
    });
  });

  it('renders HomeScreen button', async () => {
    const homeButton = screen.getByText('Home');
    expect(homeButton).toBeInTheDocument();

    fireEvent.click(homeButton);

    await waitFor(() => {
      expect(router.state.location.pathname).toEqual('/');
    });
  });

  it('has createdBy input', async () => {
    const nameInput = screen.getByLabelText('Created By:') as HTMLInputElement;

    const inputVal = 'inputVal';
    fireEvent.change(nameInput, { target: { value: inputVal } });

    await waitFor(() => {
      expect(nameInput.value).toBe(inputVal);
    });
  });

  it('has pictureName input', async () => {
    const pictureNameInput = screen.getByLabelText('Picture Name:') as HTMLInputElement;

    const inputVal = 'inputVal';
    fireEvent.change(pictureNameInput, { target: { value: inputVal } });

    await waitFor(() => {
      expect(pictureNameInput.value).toBe(inputVal);
    });
  });
});
