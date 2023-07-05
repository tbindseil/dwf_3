import { createMemoryRouter } from 'react-router-dom';
import { routes } from '../routes';

export const createMemoryRouterWrapper = (initialEntries: string[]) => {
  return createMemoryRouter(routes, {
    initialEntries: initialEntries,
  });
};
