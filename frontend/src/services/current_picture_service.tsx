import { PictureDatabaseShape, PictureResponse, PixelUpdate } from 'dwf-3-models-tjb';
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

      // setup raster handler AND start receiving updates, and request raster
      socket.removeListener('picture_response');
      socket.on('picture_response', this.setCurrentRaster);

      socket.removeListener('server_to_client_update');
      socket.on('server_to_client_update', this.handleUpdate);

      socket.emit('picture_request', { filename: picture.filename });
    },
    setCurrentRaster(pictureResponse: PictureResponse): void {
      // this is private...
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
    handleUpdate(pixelUpdate: PixelUpdate): void {
      // what if I get an update before I get the initial raster? need to buffer it i guess
      currentRaster.handlePixelUpdate(pixelUpdate);
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
