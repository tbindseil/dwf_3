import MockPictureService from './picture_service';

export function MockGlobalServices({ children }: any) {
  return (
    <>
      <MockPictureService>{children}</MockPictureService>
    </>
  );
}
