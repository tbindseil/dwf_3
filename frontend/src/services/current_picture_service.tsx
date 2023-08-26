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
  // TODO probably can remove this from interface
  getCurrentRaster(): Raster;
  getDisplayRaster(): Raster;
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

  // hmmm, reminds me of situations that resulted in a queue previously
  let awaitingAck = false;
  let outOfOrderUpdates: PixelUpdate[] = [];

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

      if (awaitingAck) {
        outOfOrderUpdates.push(pixelUpdate);
      }
    },
    // how do I know that these will happen in order?
    handleUserUpdate(pixelUpdate: PixelUpdate): void {
      // TODO can't send until join picture response received
      displayRaster.handlePixelUpdate(pixelUpdate);
      awaitingAck = true;
      socket.emit('client_to_server_udpate', pixelUpdate, () => {
            console.log('ack emit client_to_server_udpate');
            if (outOfOrderUpdates.length > 0) {
                // we are out of sync
                displayRaster = currentRaster.copy();
            }

            // reset synchronization mechanism
            awaitingAck = false;
            outOfOrderUpdates = [];
            

            // this means we have to ack but not broadcast back to sending client
            // instead, could we just send to everyone?
            //
            // or maybe send to everyone AND ack, use the ack as a synchronized point

            // we really only need to keep track of IF there were updates receivfed between sending
            // update and receiving ack. if so, we blot current raster to display raster and cldear things out
            //
            // hmmm can different rounds of this intermingle?
            // i think first i must determine how updates are broadcasted back to the client
            //
            // option 1. broadcast like other clients
            // option 2. return with an ack
            //
            // option 2 is way more work and option 1 is pretty chill
            //
            // but, option 2 requires filtering on the client side upon receiving the updates
            //
            // this could be done by adding socketId to the pixelUpdate, or by giving all updates a uuid
            // all updates having a uuid would be helpful if rounds overlapped
            //
            // so a scenario to consider (for intermingling rounds):
            // clientB sends updateB1
            // clientA sends updateA1
            // clientA updates displayRaster with updateA1
            // clientA sends updateA2
            // clientA updates displayRaster with updateA2
            // clientA receives updateB1 and updates currentRaster with updateB1 and displayRaster with B1
            // clientA receives updateA1 and updates currentRaster with updateA1
            // clientA receives updateA2 and updates currentRaster with updateA2
            //
            // so here, clientA has two rasters:
            // currentRaster (matches server):
            // raster + updateB1 + updateA1 + updateA2
            // displayRaster
            // raster + updateA1 + updateA2 + updateB1
            //
            // would single round isolation apply here?
            // i bet it would if things were reset at sending of updateA2
            // but with the way things are written right now, we are clearing after updateA1 is acked
            // and that will leave the raster copied after updateA1 and not updateA2
            // ie, displayRaster will be:
            // raster + updateB1 + updateA1
            // which is still not equivalent to current/server raster
            //
            // so its on a per userUpdate basis
            // if any nonuser updates have come in inbetween a user update being sent /applied to the
            // current raster and it being acked, then upon ack, we need to copy
            //
            // I think this is the winner
            //
            // and it could even be further optimized by only keeping track of the latest update
            // and identifing the latest update is doable with the uuid on updates
            //
            // TJTAG consider below..
            // hmm, maybe on other updates, we just copy the currentRaster to the displayRaster everytime we get an update from server?
            // pretty simple, possibly time consuming
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
