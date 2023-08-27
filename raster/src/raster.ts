// TODO test this one
export class Raster {
  public readonly width: number;
  public readonly height: number;
  private readonly asArray: Uint8ClampedArray;

  constructor(width: number, height: number, buffer: ArrayBuffer) {
    this.width = width;
    this.height = height;
    this.asArray = new Uint8ClampedArray(buffer);
  }

  public getBuffer(): Uint8ClampedArray {
    return this.asArray;
  }

  public saveBufferForDebug(): Uint8ClampedArray {
    const ret = new Uint8ClampedArray(this.asArray.length);
    for (let i = 0; i < ret.length; ++i) {
      ret[i] = this.asArray[i];
    }
    return ret;
  }

  public copy(): Raster {
    const copiedBuffer = new Uint8ClampedArray(this.asArray.length);
    for (let i = 0; i < copiedBuffer.length; ++i) {
      copiedBuffer[i] = this.asArray[i];
    }
    return new Raster(this.width, this.height, copiedBuffer);
  }


  public printBufferDifference(saved: Uint8ClampedArray) {
    for (let i = 0; i < saved.length; ++i) {
      if (saved[i] !== this.asArray[i]) {
        console.log(
          `saved[${i}] is ${saved[i]} but asArray[${i}] is ${this.asArray[i]}`
        );
      }
    }
  }
}
