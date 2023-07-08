import Contextualizer from './contextualizer';
import { IPictureService } from './picture_service';
import ProvidedServices from './provided_services';

export const MockPictureServiceContext = Contextualizer.createContext(
  ProvidedServices.MockPictureService,
);
export const useMockPictureService = (): IPictureService =>
  Contextualizer.use<IPictureService>(ProvidedServices.MockPictureService);

const MockPictureService = ({ children }: any) => {
  const mockPictureService = {
    // async createPicture(createdBy: string, pictureName: string): Promise<void>: jest.fn(),
    async createPicture(createdBy: string, pictureName: string): Promise<void> {
      createdBy;
      pictureName;
      console.log('MockPictureService.createPicture');
    },
  };

  return (
    <>
      <MockPictureServiceContext.Provider value={mockPictureService}>
        {children}
      </MockPictureServiceContext.Provider>
    </>
  );
};

export default MockPictureService;
