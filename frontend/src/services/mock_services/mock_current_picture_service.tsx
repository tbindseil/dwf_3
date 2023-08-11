import Contextualizer from '../contextualizer';
import { ICurrentPictureService } from '../current_picture_service';
import ProvidedServices from '../provided_services';

export const MockCurrentPictureServiceContext = Contextualizer.createContext(
  ProvidedServices.MockCurrentPictureService,
);
export const useMockCurrentPictureService = (): ICurrentPictureService =>
  Contextualizer.use<ICurrentPictureService>(ProvidedServices.MockCurrentPictureService);

export const mockCurrentPictureService = {
  setCurrentPicture: jest.fn(),
  getCurrentPicture: jest.fn(),
  getCurrentRaster: jest.fn(),
  handleUserUpdate: jest.fn(),
};

const MockCurrentPictureService = ({ children }: any) => {
  return (
    <>
      <MockCurrentPictureServiceContext.Provider value={mockCurrentPictureService}>
        {children}
      </MockCurrentPictureServiceContext.Provider>
    </>
  );
};

export default MockCurrentPictureService;
