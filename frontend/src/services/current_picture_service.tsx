import {
  PictureDatabaseShape,
  JoinPictureResponse,
  PixelUpdate,
  ServerToClientEvents,
  ClientToServerEvents,
} from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import Contextualizer from './contextualizer';
import ProvidedServices from './provided_services';
import { Socket, io } from 'socket.io-client';

const ENDPOINT = 'http://127.0.0.1:6543/';
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(ENDPOINT);

export interface ICurrentPictureService {
  setCurrentPicture(picture: PictureDatabaseShape): void;
  getCurrentPicture(): PictureDatabaseShape;
  getCurrentRaster(): Raster;
  handleUserUpdate(pixelUpdate: PixelUpdate): void;
}

export const CurrentPictureServiceContext = Contextualizer.createContext(
  ProvidedServices.CurrentPictureService,
);
export const useCurrentPictureService = (): ICurrentPictureService =>
  Contextualizer.use<ICurrentPictureService>(ProvidedServices.CurrentPictureService);

const CurrentPictureService = ({ children }: any) => {
  let currentPicture: PictureDatabaseShape;

  // keep track of two rasters
  // one to show user updates immediately
  // one to handle race condition
  let currentRaster: Raster;
  let displayRaster: Raster;

  socket.on('connect', () => {
    setupListeners();
  });

  const setupListeners = () => {
    socket.removeListener('join_picture_response');
    socket.on('join_picture_response', currentPictureService.setCurrentRaster);

    socket.removeListener('server_to_client_update');
    socket.on('server_to_client_update', currentPictureService.handleReceivedUpdate);
  };

  const currentPictureService = {
    setCurrentPicture(picture: PictureDatabaseShape): void {
      // we are relying on the app closing, the socket getting cleaned periodically somehow?
      // because we only leave when we join a new one
      // I guess i could do it on pagehide..
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event
      if (currentPicture !== picture) {
        this.leaveCurrentPicture();
      }
      currentPicture = picture;
      this.joinCurrentPicture();
      setupListeners();
    },
    setCurrentRaster(joinPictureResponse: JoinPictureResponse): void {
      // this is private... ie not in the interface
      currentRaster = new Raster(
        joinPictureResponse.width,
        joinPictureResponse.height,
        joinPictureResponse.data,
      );
      displayRaster = new Raster(
        joinPictureResponse.width,
        joinPictureResponse.height,
        joinPictureResponse.data,
      );
    },
    getCurrentPicture(): PictureDatabaseShape {
      return currentPicture;
    },
    joinCurrentPicture(): void {
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
    getDisplayRaster(): Raster {
        return displayRaster;
    },
    handleReceivedUpdate(pixelUpdate: PixelUpdate): void {
      // what if I get an update before I get the initial raster? need to buffer it i guess
      // ^ i think that's impossible thanks to the priority queue nature of the broadcast mediator
      currentRaster.handlePixelUpdate(pixelUpdate);
      displayRaster.handlePixelUpdate(pixelUpdate);
    },
    // how do I know that these will happen in order?
    handleUserUpdate(pixelUpdate: PixelUpdate): void {
      // TODO can't send until join picture response received
      currentRaster.handlePixelUpdate(pixelUpdate);
      socket.emit('client_to_server_udpate', pixelUpdate, () => {
            console.log('ack emit client_to_server_udpate');
            // this means we have to ack but not broadcast back to sending client
            // instead, could we just send to everyone?
            //
            // or maybe send to everyone AND ack, use the ack as a synchronized point
      });
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
