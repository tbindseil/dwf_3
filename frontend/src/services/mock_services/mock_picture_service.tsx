import Contextualizer from '../contextualizer';
import { IPictureService } from '../picture_service';
import ProvidedServices from '../provided_services';

export const MockPictureServiceContext = Contextualizer.createContext(
  ProvidedServices.MockPictureService,
);
export const useMockPictureService = (): IPictureService =>
  Contextualizer.use<IPictureService>(ProvidedServices.MockPictureService);

// most of this stuff is boiler plate, copied from picture_service.tsx
// ...
// with the exception of exposing the service in order to verify how the mocks were interacted with
//
// i think with how i am going to test the provider, that will also export the internal service object
export const mockPictureService = {
  createPicture: jest.fn(),
};

const MockPictureService = ({ children }: any) => {
  return (
    <>
      <MockPictureServiceContext.Provider value={mockPictureService}>
        {children}
      </MockPictureServiceContext.Provider>
    </>
  );
};

export default MockPictureService;
