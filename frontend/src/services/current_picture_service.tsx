import { PictureDatabaseShape, PictureResponse } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import { socket } from '../context/socket';
import Contextualizer from './contextualizer';
import ProvidedServices from './provided_services';

export interface ICurrentPictureService {
  setCurrentPicture(picture: PictureDatabaseShape): void;
  getCurrentPicture(): PictureDatabaseShape;
  getCurrentRaster(): Raster;
  handleUpdate(): void;
}

export const CurrentPictureServiceContext = Contextualizer.createContext(
  ProvidedServices.CurrentPictureService,
);
export const useCurrentPictureService = (): ICurrentPictureService =>
  Contextualizer.use<ICurrentPictureService>(ProvidedServices.CurrentPictureService);

const CurrentPictureService = ({ children }: any) => {
  let currentPicture: PictureDatabaseShape;
  let currentRaster: Raster;

  const currentPictureService = {
    setCurrentPicture(picture: PictureDatabaseShape): void {
      currentPicture = picture;

      // request raster AND start receiving updates
      socket.removeListener('picture_response');
      socket.on('picture_response', this.setCurrentRaster);
      socket.emit('picture_request', { filename: picture.filename });
    },
    setCurrentRaster(pictureResponse: PictureResponse): void {
      currentRaster = new Raster(
        pictureResponse.width,
        pictureResponse.height,
        pictureResponse.data,
      );
    },
    getCurrentPicture(): PictureDatabaseShape {
      return currentPicture;
    },
    getCurrentRaster(): Raster {
      return currentRaster;
    },
    handleUpdate(): void {
      console.log('todo');
    },
  };

  return (
    <>
      <CurrentPictureServiceContext.Provider value={currentPictureService}>
        {children}
      </CurrentPictureServiceContext.Provider>
    </>
  );
};

export default CurrentPictureService;
