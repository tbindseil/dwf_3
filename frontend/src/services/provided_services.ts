enum ProvidedServices {
  PictureService,
  MockPictureService,
  CurrentPictureService,
  MockCurrentPictureService,
}

export const mockServicesMap = new Map<ProvidedServices, ProvidedServices>();
mockServicesMap.set(ProvidedServices.PictureService, ProvidedServices.MockPictureService);
mockServicesMap.set(
  ProvidedServices.CurrentPictureService,
  ProvidedServices.MockCurrentPictureService,
);

export default ProvidedServices;
