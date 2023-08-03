import { PictureDatabaseShape, PictureResponse, PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import Contextualizer from './contextualizer';
import ProvidedServices from './provided_services';
import { io } from 'socket.io-client';

const ENDPOINT = 'http://127.0.0.1:6543/';
const socket = io(ENDPOINT);

export interface ICurrentPictureService {
  setCurrentPicture(picture: PictureDatabaseShape): void;
  getCurrentPicture(): PictureDatabaseShape;
  getCurrentRaster(): Raster;
  handleReceivedUpdate(pixelUpdate: PixelUpdate): void;
  handleUserUpdate(pixelUpdate: PixelUpdate): void;

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
    setupListeners();
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

    console.log(
      `TJTAG emitting picture_request and currentPicture.filename is: ${currentPicture.filename}`,
    );
    socket.emit('picture_request', {
      filename: currentPicture.filename,
    });
  };

  const currentPictureService = {
    setCurrentPicture(picture: PictureDatabaseShape): void {
      currentPicture = picture;
      setupListeners();
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

// so,
// how am i gonna do this?
// 1, 2, or 3 rasters?
//
// how long does it take to copy the entire raster?
//
// void event;
// console.log('timing a raster copy');
// //  const currentRaster = currentPictureService.getCurrentRaster();
// const currentRaster = raster;
// const currentMutableBuffer = currentRaster.getBuffer();
// const newBuffer = new ArrayBuffer(currentRaster.width * currentRaster.height);
// const newMutableBuffer = new Uint8ClampedArray(newBuffer);
//
// console.log(
//   `currentRaster.w = ${currentRaster.width} and currentRaster.h = ${currentRaster.height}`,
// );
//
// const start = performance.now();
// for (let i = 0; i < currentMutableBuffer.byteLength; ++i) {
//   newMutableBuffer[i] != currentMutableBuffer.at(i);
// }
// const end = performance.now();
//
// console.log(
//   `currentRaster.w = ${currentRaster.width} and currentRaster.h = ${currentRaster.height}`,
// );
// console.log(`copy time is: ${end} - ${start} = ${end - start}`);
//
// its kind of irrelevant though because it will depend on what machine its running on
//
// but I just wrapped it like done in raster.ts and found the following:
// * 1619 * 1000 pixels in 433 ms
//
// basically, I could update once or twice a second if doing full copies at this size
//
//
// so, I need to keep things up to date
//
// would I find any advntage to two buffers?
//
// really, that's all implementation details of the current_picture_service
//
// it just needs a draw update function
