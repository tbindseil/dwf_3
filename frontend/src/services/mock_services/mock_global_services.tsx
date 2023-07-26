import MockCurrentPictureService from './mock_current_picture_service';
import MockPictureService from './mock_picture_service';

export function MockGlobalServices({ children }: any) {
  return (
    <>
      <MockPictureService>
        <MockCurrentPictureService>{children}</MockCurrentPictureService>
      </MockPictureService>
    </>
  );
}
