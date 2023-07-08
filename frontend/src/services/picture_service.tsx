import Contextualizer from './contextualizer';
import ProvidedServices from './provided_services';

export interface IPictureService {
  createPicture(createdBy: string, pictureName: string): Promise<void>;
}

export const PictureServiceContext = Contextualizer.createContext(ProvidedServices.PictureService);
export const usePictureService = (): IPictureService =>
  Contextualizer.use<IPictureService>(ProvidedServices.PictureService);

const PictureService = ({ children }: any) => {
  const pictureService = {
    async createPicture(createdBy: string, pictureName: string): Promise<void> {
      fetch('http://localhost:8080/picture', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ createdBy: createdBy, name: pictureName }),
      })
        .then((result) => result.json())
        .then(
          (result) => console.log(`result is: ${result}`),
          (error) => console.log(`first catch and error is: ${error}`),
        )
        .catch((error) => console.log(`last catch and error is: ${error}`));
    },
  };

  return (
    <>
      <PictureServiceContext.Provider value={pictureService}>
        {children}
      </PictureServiceContext.Provider>
    </>
  );
};

const MockPictureService = ({ children }: any) => {
  const pictureService = {
    async createPicture(createdBy: string, pictureName: string): Promise<void> {
      createdBy;
      pictureName;
      console.log('MockPictureService.createPicture');
    },
  };

  return (
    <>
      <PictureServiceContext.Provider value={pictureService}>
        {children}
      </PictureServiceContext.Provider>
    </>
  );
};

export default PictureService;
