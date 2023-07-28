import { render, screen } from '@testing-library/react';
import { createMemoryRouterWrapper } from '../test_utils/memoryRouterFactory';
import { MockGlobalServices } from '../services/mock_services/mock_global_services';
import { RouterProvider } from 'react-router-dom';
import { mockCurrentPictureService } from '../services/mock_services/mock_current_picture_service';

describe('Canvas tests', () => {
  beforeEach(() => {
    mockCurrentPictureService.setCurrentPicture.mockClear();

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
