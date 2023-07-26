import { createMemoryRouter } from 'react-router-dom';
import { screens } from '../components/screens';

export const createMemoryRouterWrapper = (initialEntries: string[]) => {
  return createMemoryRouter(screens, {
    initialEntries: initialEntries,
  });
};

// TJTAG TODO
// well first problem, can't pass state (and doesn't handle no state well)
// so, I should change it from state that's passed in global app state
// now comes the brainstorm options and pros and cons
// 1. add it to picture service
