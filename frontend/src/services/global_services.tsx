import PictureService from './picture_service';

export function GlobalServices({ children }: any) {
  return (
    <>
      <PictureService>{children}</PictureService>
    </>
  );
}
