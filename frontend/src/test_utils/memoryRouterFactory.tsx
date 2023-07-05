import { createMemoryRouter } from 'react-router-dom';
// TODO screens dir and barel file
import { HomeScreen } from '../components/home_screen';
import { NewPictureScreen } from '../components/new_picture_screen';
import { PicturesScreen } from '../components/pictures_screen';

export const createMemoryRouterWrapper = (initialEntries: string[]) => {
  // this is duplicated in App.tsx
  return createMemoryRouter(
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
      initialEntries: initialEntries,
    },
  );
};
