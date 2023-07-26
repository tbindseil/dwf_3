import { PictureDatabaseShape } from 'dwf-3-models-tjb';
import Contextualizer from './contextualizer';
import ProvidedServices from './provided_services';

export interface ICurrentPictureService {
  setCurrentPicture(picture: PictureDatabaseShape): void;
}

export const CurrentPictureServiceContext = Contextualizer.createContext(
  ProvidedServices.CurrentPictureService,
);
export const useCurrentPictureService = (): ICurrentPictureService =>
  Contextualizer.use<ICurrentPictureService>(ProvidedServices.CurrentPictureService);

const CurrentPictureService = ({ children }: any) => {
  let currentPicture: PictureDatabaseShape;
  const currentPictureService = {
    setCurrentPicture(picture: PictureDatabaseShape): void {
      currentPicture = picture;
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
