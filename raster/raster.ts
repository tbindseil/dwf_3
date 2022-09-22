import { PixelUpdate } from 'dwf-3-models-tjb';

export class Raster {
    public readonly width: number;
    public readonly height: number;
    // private readonly asArray: Uint8ClampedArray;
    readonly asArray: Uint8ClampedArray;

    constructor(width: number, height: number, buffer: ArrayBuffer) {
        console.log(`raster constructor called with w h as ${width} ${height}`);
        this.width = width;
        this.height = height;
        this.asArray = new Uint8ClampedArray(buffer);
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

    public handlePixelUpdate(pixelUpdate: PixelUpdate): void {
        const imageDataOffset = 4 * (pixelUpdate.y * this.width + pixelUpdate.x);
        const red = this.clamp(pixelUpdate.red);
        const green = this.clamp(pixelUpdate.green);
        const blue = this.clamp(pixelUpdate.blue);

        // console.log('raster.handlePixelUpdate:');
        // console.log(`  raster.width: ${this.width} raster.height: ${this.height}`);
        // console.log(`  imageDataOffset: ${imageDataOffset} red: ${red} blue: ${blue} green: ${green}`);

        this.asArray[imageDataOffset] = red;
        this.asArray[imageDataOffset + 1] = green;
        this.asArray[imageDataOffset + 2] = blue;
    }

    public getBuffer(): Uint8ClampedArray {
        return this.asArray;
    }

    public saveBufferForDebug(): Uint8ClampedArray {
        // console.log(`this.asArray.length is: ${this.asArray.length}`);
        const ret = new Uint8ClampedArray(this.asArray.length);
        for (let i = 0; i < ret.length; ++i) {
            ret[i] = this.asArray[i];
        }
        return ret;
    }

    public printBufferDifference(saved: Uint8ClampedArray) {
        for (let i = 0; i < saved.length; ++i) {
            if (saved[i] !== this.asArray[i]) {
                console.log(`saved[${i}] is ${saved[i]} but asArray[${i}] is ${this.asArray[i]}`);
            }
        }
    }
}
