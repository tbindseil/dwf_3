import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HomeScreen } from './home_screen';

import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory({ window });

describe('HomeScreen tests', () => {
  beforeEach(() => {
    render(
      // what would https://kentcdodds.com/blog/common-mistakes-with-react-testing-library say?
      <HistoryRouter history={history}>
        <HomeScreen />
      </HistoryRouter>,
    );
  });

  it('renders PicturesScreen button', () => {
    const picturesButton = screen.getByText('Pictures');
    expect(picturesButton).toBeInTheDocument();

    fireEvent.click(picturesButton);

    // ...
  });

  it('renders NewPictureScreen button', async () => {
    // const history = createMemoryHistory();

    const newPictureButton = screen.getByText('New Picture');
    expect(newPictureButton).toBeInTheDocument();

    fireEvent.click(newPictureButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe('/new-picture');
    });

    // expect(history.location.pathname).toBe('/location1');

    // const createdBy = screen.getByText('Created By');
    // expect(createdBy).toBeInTheDocument();
  });
});
