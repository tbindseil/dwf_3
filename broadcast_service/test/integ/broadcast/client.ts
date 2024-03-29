import { Socket, io } from 'socket.io-client';

import {
    ServerToClientEvents,
    ClientToServerEvents,
    JoinPictureResponse,
    Update,
    PixelUpdate,
} from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';

import { performance } from 'perf_hooks';

import { ClientScript } from './client_script';
import { delay } from './misc';

export class Client {
    private static readonly ENDPOINT = 'http://127.0.0.1:6543/';

    private readonly socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    private readonly script: ClientScript;
    private readonly clientID: string;
    private readonly filename: string;
    private readonly receivedUpdates: Map<number, Update> = new Map();
    private readonly sentUpdates: Map<number, Update> = new Map();

    private raster?: Raster;

    private readonly debugEnabled: boolean;

    public constructor(
        script: ClientScript,
        clientID: string,
        filename: string,
        debugEnabled = false
    ) {
        this.socket = io(Client.ENDPOINT);
        this.script = script;
        this.clientID = clientID;
        this.filename = filename;
        this.debugEnabled = debugEnabled;

        this.socket.on('connect', () => {
            this.debug(`connected callback and sid is: ${this.socket.id}`);
        });

        this.socket.on('server_to_client_update', (update: Update) => {
            this.debug(
                `receiving update: ${update.uuid} @ ${performance.now()}`
            );

            this.receivedUpdates.set(performance.now(), update);
            if (this.raster) {
                Update.updateRaster(this.raster, update);
            } else {
                throw Error('receiving update before setting raster');
            }
        });
    }

    public async joinPicture(): Promise<Client> {
        if (this.script.initialWait) {
            await delay(this.script.initialWait);
            this.debug(
                `clientNum_${this.clientID} done waiting ${this.script.initialWait}ms`
            );
        }

        return new Promise<Client>((resolve) => {
            this.socket.on(
                'join_picture_response',
                async (joinPictureResponse: JoinPictureResponse) => {
                    this.debug(
                        `received join_picture_response for socketid: ${this.socket.id}`
                    );

                    this.raster = new Raster(
                        joinPictureResponse.width,
                        joinPictureResponse.height,
                        joinPictureResponse.data
                    );

                    resolve(this);
                }
            );
            this.socket.emit('join_picture_request', {
                filename: this.filename,
            });
        });
    }

    public async start(): Promise<void> {
        // TODO do i even need this to be wrapped in a promise? isn't that what async await is for?
        // return new Promise<void>(async (resolve) => {
        // need to forloop to serialize these
        for (let i = 0; i < this.script.actions.length; ++i) {
            const currAction = this.script.actions[i];

            currAction.sentAt = performance.now();
            const pixelUpdate = new PixelUpdate({
                ...currAction.unsentPixelUpdate,
                filename: this.filename,
                createdBy: this.clientID,
            });

            this.debug(
                `sending update: ${pixelUpdate.uuid} @ ${currAction.sentAt} then waiting ${currAction.postActionWaitMS}ms`
            );

            this.socket.emit('client_to_server_udpate', pixelUpdate);
            this.sentUpdates.set(currAction.sentAt, pixelUpdate);

            await delay(currAction.postActionWaitMS);
        }
        // resolve();
        // });
    }

    public getReceivedUpdates(): Map<number, Update> {
        return this.receivedUpdates;
    }

    public getSentUpdates(): Map<number, Update> {
        return this.sentUpdates;
    }

    public getRaster(): Raster {
        if (this.raster) {
            return this.raster;
        } else {
            throw Error('raster requested before its received');
        }
    }

    public async close(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.socket.on('leave_picture_response', () => {
                this.debug(
                    `received leave_picture_response on socekt: ${this.socket.id}`
                );
                this.socket.close();
                resolve();
            });
            this.socket.emit('leave_picture_request', {
                filename: this.filename,
            });
            this.debug(
                `emitting leave_picture_request on socekt: ${this.socket.id}`
            );
        });
    }

    public makeUpdatesFileString(): string {
        let ret = `printing picture update ids for client_${this.clientID}`;
        this.getReceivedUpdates().forEach((u) => (ret += `\n    ${u.uuid}`));
        return ret;
    }

    public debug(msg: string, force = false) {
        if (force || this.debugEnabled) console.log(msg);
    }
}
