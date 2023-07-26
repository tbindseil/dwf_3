import { createMemoryRouter } from 'react-router-dom';
import { screens } from '../components/screens';

export const createMemoryRouterWrapper = (initialEntries: string[]) => {
  return createMemoryRouter(screens, {
    initialEntries: initialEntries,
  });
};
