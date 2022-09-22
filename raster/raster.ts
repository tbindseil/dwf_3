import { PixelUpdate } from 'dwf-3-models-tjb';

export class Raster {
    public readonly width: number;
    public readonly height: number;
    private readonly asArray: Uint8ClampedArray;

    constructor(width: number, height: number, buffer: ArrayBuffer) {
        this.width = width;
        this.height = height;
        this.asArray = new Uint8ClampedArray(buffer);
    }

    public handlePixelUpdate(pixelUpdate: PixelUpdate): void {
        const imageDataOffset = 4 * (pixelUpdate.y * this.width + pixelUpdate.x);
        const red = pixelUpdate.red > 255 ? 255 : pixelUpdate.red;
        const green = pixelUpdate.green > 255 ? 255 : pixelUpdate.green;
        const blue = pixelUpdate.blue > 255 ? 255 : pixelUpdate.blue;

        this.asArray[imageDataOffset] = red;
        this.asArray[imageDataOffset + 1] = green;
        this.asArray[imageDataOffset + 2] = blue;
    }

    public getBuffer(): Uint8ClampedArray {
        return this.asArray;
    }
}
