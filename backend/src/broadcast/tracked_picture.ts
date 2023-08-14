import { Client } from "pg";
import { Queue } from "./queue";
import { Raster } from "dwf-3-raster-tjb";
import { PixelUpdate } from "dwf-3-models-tjb";

export class TrackedPicture {
    public idToClientMap: Map<string, Client>;
    public dirty: boolean;
    public workQueue: Queue;
    public raster?: Raster;

    // these are updates that have been broadcast but haven't been applied to the local copy of the raster
    pendingUpdates: PixelUpdate[];
    public constructor(queue: Queue) {

    }
}
