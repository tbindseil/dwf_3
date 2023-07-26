import CurrentPictureService from './current_picture_service';
import PictureService from './picture_service';

export function GlobalServices({ children }: any) {
  return (
    <>
      <PictureService>
        <CurrentPictureService>{children}</CurrentPictureService>
      </PictureService>
    </>
  );
}
