import MockPictureService from './mock_picture_service';

export function MockGlobalServices({ children }: any) {
  return (
    <>
      <MockPictureService>{children}</MockPictureService>
    </>
  );
}
