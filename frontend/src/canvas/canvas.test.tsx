import { render, screen } from '@testing-library/react';
import { createMemoryRouterWrapper } from '../test_utils/memoryRouterFactory';
import { MockGlobalServices } from '../services/mock_services/mock_global_services';
import { RouterProvider } from 'react-router-dom';

describe('Canvas tests', () => {
  beforeEach(() => {
    const router = createMemoryRouterWrapper(['/picture']);
    render(
      <MockGlobalServices>
        <RouterProvider router={router} />
      </MockGlobalServices>,
    );
  });

  it('debugs the screen', () => {
    screen.debug();
  });
});
