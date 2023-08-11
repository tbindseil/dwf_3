import { PictureDatabaseShape, JoinPictureResponse, PixelUpdate } from 'dwf-3-models-tjb';
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
  joinCurrentPicture(): void;
  leaveCurrentPicture(): void;
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
    // setup raster handler AND start receiving updates, and request raster
    socket.removeListener('join_picture_response');
    socket.on('join_picture_response', currentPictureService.setCurrentRaster);

    socket.removeListener('server_to_client_update');
    socket.on('server_to_client_update', currentPictureService.handleReceivedUpdate);
  };

  const currentPictureService = {
    setCurrentPicture(picture: PictureDatabaseShape): void {
      currentPicture = picture;
      setupListeners();
    },
    setCurrentRaster(joinPictureResponse: JoinPictureResponse): void {
      // this is private...
      currentRaster = new Raster(
        joinPictureResponse.width,
        joinPictureResponse.height,
        joinPictureResponse.data,
      );
    },
    getCurrentPicture(): PictureDatabaseShape {
      return currentPicture;
    },
    joinCurrentPicture(): void {
      if (!currentPicture) {
        console.error('attempting to join before setting current picture');
        return;
      }
      socket.emit('join_picture_request', {
        filename: currentPicture.filename,
      });
    },
    leaveCurrentPicture(): void {
      if (!currentPicture) {
        console.error('attempting to leave before setting current picture');
        return;
      }
      socket.emit('leave_picture_request', {
        filename: currentPicture.filename,
      });
    },
    getCurrentRaster(): Raster {
      return currentRaster;
    },
    handleReceivedUpdate(pixelUpdate: PixelUpdate): void {
      // what if I get an update before I get the initial raster? need to buffer it i guess
      currentRaster.handlePixelUpdate(pixelUpdate);
    },
    // how do I know that these will happen in order?
    handleUserUpdate(pixelUpdate: PixelUpdate): void {
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
