import {
  PictureDatabaseShape,
  JoinPictureResponse,
  PixelUpdate,
  ServerToClientEvents,
  ClientToServerEvents,
  Update,
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
  let currentRaster: Raster;

  const pendingUserUpdates = new Map<string, Update>();

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
      setupListeners();
      this.joinCurrentPicture();
    },
    setCurrentRaster(joinPictureResponse: JoinPictureResponse): void {
      // this is private... ie not in the interface
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
      const copy = currentRaster.copy();
      // copy is critical, so we maintain the current raster as a source of truth
      // otherwise we would have to unapply
      // maybe thats how we undo? when we apply, each update remembers what
      // it chaned things from and can be undone
      // InverseUpdate
      pendingUserUpdates.forEach((u) => u.updateRaster(copy));
      return copy;
    },
    handleReceivedUpdate(pixelUpdate: PixelUpdate): void {
      // what if I get an update before I get the initial raster? need to buffer it i guess
      // ^ i think that's impossible thanks to the priority queue nature of the broadcast mediator
      pixelUpdate.updateRaster(currentRaster);
      pendingUserUpdates.delete(pixelUpdate.guid);
    },
    // how do I know that these will happen in order?
    // TODO change all pixelupdate to update
    handleUserUpdate(pixelUpdate: PixelUpdate): void {
      pendingUserUpdates.set(pixelUpdate.guid, pixelUpdate);

      // TODO can't send until join picture response received
      socket.emit('client_to_server_udpate', pixelUpdate); // , () => {
      // console.log('ack emit client_to_server_udpate');
      // pendingUserUpdates.shift();

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
      // ok, so a solution has to:
      // * leave the displayRaster in sync with the currentRaster
      // * not over update
      // * not under update
      // * show user updates immediately
      //
      // the consider below (copy current to display on all received) will over update
      // only tracking the last non-acked user update will potentially under update
      // so, we must track all non acked user updates and only copy during get display raster
      //   but i guess that's kinda weird
      //
      // ^because ... if we update without taking into account all acked, we have to replay those
      // so it violates showing user updates immediately
      //
      // this is so complicated
      //
      // so, maybe it is the above, and upon asking for displayRaster, when copy flag is active,
      // we get latest current raster (this is missing all non acked user updates), then quickly
      // add those to the copy of the current raster. this is the new display raster
      //
      // i think this solves everything, it will just take a lot of effort ot make it
      // good code
      //
      // TJTAG consider below..
      // hmm, maybe on other updates, we just copy the currentRaster to the displayRaster everytime we get an update from server?
      // pretty simple, possibly time consuming

      // so,
      // sendUserUpdate adds guid to pending_user_updates_map, initializes outOfSync to false
      // upon receiving update
      //   if (update.guid not in pending_user_updates_map) {
      //     pending_user_updates_map.foreach(u => u.outOfSync = true)
      //
      //
      // hmm i guess i don't quite get it
      // I want to copy on get display raster
      // ... as some kind of compromise between updating upon every user update ack and only the last user update ack
      // so when the getDisplayRaster is called, we want it to be all received updates with unacknowledged user updates on top
      // which means we also need to return user updates back in addition to ack. Well that part not necessarily
      //
      // so display raster is ephemeral
      // it is a copy of current raster (all received) plus all pending updates
      // i think ordering means i don't have to worry about guid, just queue.shift when i get an ack
      // i'd rather do gui - TODO
      // ... doing that next
      // pros and cons
      // pros
      // each update is tagged
      // dont need to ack
      // cons
      // need to assign
      //
      // but i think i can change it to a class and initialize it in the constructor
      // then, that is a stepping stone for the next thing, which is different updates
      // becasue each update can have an updateRaster method (taking in raster)
      //
      // so here we go!
      // });
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
