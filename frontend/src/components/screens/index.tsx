import Canvas from '../../canvas/canvas';
import { HomeScreen } from './home_screen';
import { PicturesScreen } from './pictures_screen';
import { NewPictureScreen } from './new_picture_screen';

export const screens = [
  { path: '/', element: <HomeScreen /> },
  { path: '/pictures', element: <PicturesScreen /> },
  { path: '/new-picture', element: <NewPictureScreen /> },
  { path: '/picture', element: <Canvas /> },
];
