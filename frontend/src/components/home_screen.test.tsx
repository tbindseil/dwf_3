import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HomeScreen } from './home_screen';

describe('HomeScreen tests', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <HomeScreen />
      </BrowserRouter>,
    );
  });

  it('renders PicturesScreen button', () => {
    const picturesButton = screen.getByText('Pictures');
    expect(picturesButton).toBeInTheDocument();

    fireEvent.click(picturesButton);

    // ...
  });

  it('renders NewPictureScreen button', () => {
    // const history = createMemoryHistory();

    const newPictureButton = screen.getByText('New Picture');
    expect(newPictureButton).toBeInTheDocument();

    fireEvent.click(newPictureButton);

    // expect(history.location.pathname).toBe('/location1');

    // const createdBy = screen.getByText('Created By');
    // expect(createdBy).toBeInTheDocument();
  });
});
