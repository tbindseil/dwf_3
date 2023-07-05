import Canvas from './canvas/canvas';
// TODO screens dir and barel file
import { HomeScreen } from './components/home_screen';
import { PicturesScreen } from './components/pictures_screen';
import { NewPictureScreen } from './components/new_picture_screen';

export const routes = [
  { path: '/', element: <HomeScreen /> },
  { path: '/pictures', element: <PicturesScreen /> },
  { path: '/new-picture', element: <NewPictureScreen /> },
  { path: '/picture', element: <Canvas /> },
  { path: '/', element: <HomeScreen /> },
];
