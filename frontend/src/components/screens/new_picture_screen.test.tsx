import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { MockGlobalServices } from '../../services/mock_services/mock_global_services';
import { mockPictureService } from '../../services/mock_services/mock_picture_service';
import { createMemoryRouterWrapper } from '../../test_utils/memoryRouterFactory';

describe('NewPictureScreen tests', () => {
  let router: ReturnType<typeof createMemoryRouterWrapper>;

  beforeEach(() => {
    // TODO dry this out
    mockPictureService.getPictures.mockClear();
    mockPictureService.getPictures.mockResolvedValue({ pictures: [] });

    router = createMemoryRouterWrapper(['/new-picture']);
    render(
      <MockGlobalServices>
        <RouterProvider router={router} />
      </MockGlobalServices>,
    );

    mockPictureService.createPicture.mockClear();
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

  it('has createPicture button', () => {
    const createPictureButton = screen.getByText('Create Picture');
    expect(createPictureButton).toBeInTheDocument();

    const createdByInput = screen.getByLabelText('Created By:') as HTMLInputElement;
    const createdByInputVal = 'nameInputVal';
    fireEvent.change(createdByInput, { target: { value: createdByInputVal } });

    const pictureNameInput = screen.getByLabelText('Picture Name:') as HTMLInputElement;
    const pictureNameInputVal = 'nameInputVal';
    fireEvent.change(pictureNameInput, { target: { value: pictureNameInputVal } });

    fireEvent.click(createPictureButton);

    expect(mockPictureService.createPicture).toBeCalledWith({
      createdBy: createdByInputVal,
      name: pictureNameInputVal,
      width: 1000,
      height: 1000,
    });
  });

  it('displays an error when the picture fails to be created', async () => {
    expect(() => screen.getByText('Error creating picture')).toThrow();

    mockPictureService.createPicture.mockImplementation(() => {
      throw new Error('throwing instead of rejecting');
    });

    const createPictureButton = screen.getByText('Create Picture');
    fireEvent.click(createPictureButton);

    await waitFor(() => {
      const errorText = screen.getByText('Error creating picture');
      expect(errorText).toBeInTheDocument();
    });
  });
});
