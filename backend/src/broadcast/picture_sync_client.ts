import Client from './client';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import { Queue } from './queue';

export class PictureSyncClient extends Client {
    private readonly queue: Queue;
    private readonly pictureAccessor: PictureAccessor;
    private readonly raster: Raster;
    private readonly filename: string;

    private readonly writingInterval: NodeJS.Timer;
    private dirty: boolean;
    private unwrittenWrites: PixelUpdate[];

    // two rasters
    // one is locked in and updates are tracked while they are applied to the other
    // then, when a new client is registered, broadcast mediator gets the tracked updates and sends them to the new client
    // upon the writing of the updated raster,
    //  it becomes the new locked raster,
    //  the tracked updates are cleared,
    //  and the old raster is synced (this can be either with a copy or by applying the tracked updates)
    //
    // well i think i can do it with just the one
    // no, i actually cant cause i have to be able to supply the list of updates since write
    // or,
    // i have a dedicatred update sync client
    // that tracks the raster and updates?
    //
    // why do i need the list of updates?
    //
    //
    // all of this means i am still abusing the abstraction
    // ie broadcast client doesn't have the ability to do any of this
    //
    // so maybe i need a new one?
    //
    // i mean i guess getraster would be the call but thats useless in the others,
    // the same way that close is useless
    // well close is actually good
    // so what is this?
    //
    //
    // TJTAG - ding ding ding
    // spawn a new thing that first starts listening to new things, then reads the pic, then sends the pic, then sends each update one ata time util


    public constructor(
        queue: Queue,
        pictureAccessor: PictureAccessor,
        raster: Raster,
        filename: string,
        writeInterval: number = 30000
    ) {
        super();

        this.queue = queue;
        this.pictureAccessor = pictureAccessor;

        this.raster = raster;
        this.filename = filename;
        this.dirty = false;
        this.unwrittenWrites = [];

        this.writingInterval = setInterval(async () => {
            if (this.dirty) {
                await this.writeRaster();
            }
        }, writeInterval);
    }

    public handleUpdate(pixelUpdate: PixelUpdate): void {
        this.queue.push(() => {
            return new Promise((resolve) => {
                // TODO what order should this be?
                this.unwrittenWrites.push(pixelUpdate);

                /* await if async */ this.raster.handlePixelUpdate(pixelUpdate);
                this.dirty = true;
                resolve();
            });
        });
    }

    // it seems like we wanna have one raster
    // no reading it more than once just keep it updated
    // sadly th queue seems dumb now,
    // no, its good to quickly get teh updates out to users and slowly digest them here
    // so whether we initial start a user with old and send a bunch of updates or not, i think
    // its better to not, give them a fresh one

    public async close(): Promise<void> {
        clearInterval(this.writingInterval);

        // now once we run out, add the handler to do the final write
        await this.queue.waitForCompletion();

        // and write just in case
        await this.writeRaster();
    }

    public async getLastWrittenRaster(): Promise<[Raster, PixelUpdate[]]> {
        // TODO actually synchronize and eventually (it its a lot of time to make new ones)
        await new Promise((r) => setTimeout(r, 100));
        return [this.raster, this.unwrittenWrites];
    }

    private async writeRaster() {
        // TODO lock raster
        // i Think its a reader writer lock
        await this.pictureAccessor.writeRaster(this.raster, this.filename);
        this.dirty = false;
        this.unwrittenWrites = [];
    }
}
