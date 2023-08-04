import { PictureDatabaseShape, PictureResponse, PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import Contextualizer from './contextualizer';
import ProvidedServices from './provided_services';
import { io } from 'socket.io-client';

const ENDPOINT = 'http://127.0.0.1:6543/';
console.log('TJTAG making socket');
const socket = io(ENDPOINT);

export interface ICurrentPictureService {
  setCurrentPicture(picture: PictureDatabaseShape): void;
  getCurrentPicture(): PictureDatabaseShape;
  getCurrentRaster(): Raster;
  handleReceivedUpdate(pixelUpdate: PixelUpdate): void;
  handleUserUpdate(pixelUpdate: PixelUpdate): void;
  closeConnection(): void; // maybe the socket is best owned by the canvas
  // or maybe, idk

  checkSocketStatus(): void;
}

export const CurrentPictureServiceContext = Contextualizer.createContext(
  ProvidedServices.CurrentPictureService,
);
export const useCurrentPictureService = (): ICurrentPictureService =>
  Contextualizer.use<ICurrentPictureService>(ProvidedServices.CurrentPictureService);

const CurrentPictureService = ({ children }: any) => {
  let currentPicture: PictureDatabaseShape;
  let currentRaster: Raster;

  console.log('TJTAG - setting up socket connectin handler');
  socket.on('connect', () => {
    console.log('TJTAG start connect handler');
    setupListeners();
    console.log('TJTAG end connect handler');
  });

  // so, if we miss events,
  // its bad obviously
  // but the point was that in between some things happeninug we could miss events
  //
  // now thuis next paragraph is about
  // the fact that I probably want to use rooms
  // where the room corresponds to the picture being drawn
  const setupListeners = () => {
    console.log('TJTAG setting up current listeners');

    // setup raster handler AND start receiving updates, and request raster
    socket.removeListener('picture_response');
    console.log('TJTAG 0');
    socket.on('picture_response', currentPictureService.setCurrentRaster);
    console.log('TJTAG 1');

    socket.removeListener('server_to_client_update');
    console.log('TJTAG 2');
    socket.on('server_to_client_update', currentPictureService.handleReceivedUpdate);

    console.log(`currentPicture is: ${currentPicture}`);
    console.log('TJTAG 2.5');
    //    console.log(
    //      `TJTAG emitting picture_request and currentPicture.filename is: ${currentPicture.filename}`,
    //    );
    if (currentPicture) {
      socket.emit('picture_request', {
        filename: currentPicture.filename,
      });
    }
    console.log('TJTAG 3');
  };

  const currentPictureService = {
    setCurrentPicture(picture: PictureDatabaseShape): void {
      currentPicture = picture;
      setupListeners();
    },
    setCurrentRaster(pictureResponse: PictureResponse): void {
      console.log('TJTAG setCurrentRaster');
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
    handleReceivedUpdate(pixelUpdate: PixelUpdate): void {
      console.log('TJTAG handleReceivedUpdate');
      // what if I get an update before I get the initial raster? need to buffer it i guess
      currentRaster.handlePixelUpdate(pixelUpdate);
    },
    // how do I know that these will happen in order?
    handleUserUpdate(pixelUpdate: PixelUpdate): void {
      console.log('TJTAG handleUserUpdate');
      currentRaster.handlePixelUpdate(pixelUpdate);
      socket.emit('client_to_server_udpate', pixelUpdate);
    },

    checkSocketStatus(): void {
      console.log(`disconnected is: ${socket.disconnected}`);
      console.log(`connected is: ${socket.connected}`);
      console.log(`active is: ${socket.active}`);
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
