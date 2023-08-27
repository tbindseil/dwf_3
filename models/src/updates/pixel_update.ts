import {Raster} from 'dwf-3-raster-tjb';
import { Update } from './update';

export class PixelUpdate extends Update {
    public readonly x: number;
    public readonly y: number;
    public readonly red: number;
    public readonly green: number;
    public readonly blue: number;

    public constructor(filename: string, createdBy: string, x: number, y: number, red: number, green: number, blue: number) {
        super(filename, createdBy);
        this.x = x;
        this.y = y;
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

    public updateRaster(raster: Raster) {
        const imageDataOffset = 4 * (this.y * raster.width + this.x);
        const red = this.clamp(this.red);
        const green = this.clamp(this.green);
        const blue = this.clamp(this.blue);

        raster.getBuffer()[imageDataOffset] = red;
        raster.getBuffer()[imageDataOffset + 1] = green;
        raster.getBuffer()[imageDataOffset + 2] = blue;

        console.log(`TJTAG updated at ${performance.now()}`);

        // what if we did this as several blocks of arrays? for parallization?
    }

    private clamp(val: number, min = 0, max = 255): number {
        if (val < min) {
            return min;
        } else if (val > max) {
            return max;
        } else {
            return val;
        }
    }
}
