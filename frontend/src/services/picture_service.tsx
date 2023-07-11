import Contextualizer from './contextualizer';
import ProvidedServices from './provided_services';

export interface IPictureService {
  createPicture(createdBy: string, pictureName: string): Promise<void>;
}

export const PictureServiceContext = Contextualizer.createContext(ProvidedServices.PictureService);
export const usePictureService = (): IPictureService =>
  Contextualizer.use<IPictureService>(ProvidedServices.PictureService);

export const pictureService = {
  async createPicture(createdBy: string, pictureName: string): Promise<void> {
    const result = await fetch('http://localhost:8080/picture', {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ createdBy: createdBy, name: pictureName }),
    });
    return result.json();
  },
};

const PictureService = ({ children }: any) => {
  return (
    <>
      <PictureServiceContext.Provider value={pictureService}>
        {children}
      </PictureServiceContext.Provider>
    </>
  );
};

export default PictureService;
