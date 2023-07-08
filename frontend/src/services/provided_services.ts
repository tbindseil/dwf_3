enum ProvidedServices {
  PictureService,
  MockPictureService,
}

export const mockServicesMap = new Map<ProvidedServices, ProvidedServices>();
mockServicesMap.set(ProvidedServices.PictureService, ProvidedServices.MockPictureService);

export default ProvidedServices;
