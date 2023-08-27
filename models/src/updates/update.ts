import {Raster} from 'dwf-3-raster-tjb';
import {v4 as uuidv4} from 'uuid';
import { PixelUpdateProps } from './pixel_update';

export enum UpdateTypeEnum {
    PixelUpdate = 0
}

export interface UpdateProps {
    filename: string;
    createdBy: string;
}

export abstract class Update {
    public readonly uuid = uuidv4();

    public readonly updateType: UpdateTypeEnum;
    public readonly filename: string;
    public readonly createdBy: string;

    constructor(updateType: UpdateTypeEnum, props: UpdateProps) {
        this.updateType = updateType;
        this.filename = props.filename;
        this.createdBy = props.createdBy;
    }

    // this is a mechanism to access the child classes updateRaster function without
    // changing the socket io parser from the default, basically, have all the functions
    // in a static map, and access them via an enum assigned in the props
    private static readonly updateRasterFuncs: Map<UpdateTypeEnum, (raster: Raster, props: unknown) => void> = new Map();
    public static updateRaster(raster: Raster, updateType: UpdateTypeEnum, updateProps: unknown) {
        try {
            // TODO extract updateType here , maybe it can be private
            this.updateRasterFuncs.get(updateType)!(raster, updateProps);
        } catch (e: unknown) {
            console.error(`issue calling updateRaster, error is: ${e}`);
        }
    }

    static {
        console.log('TJTAG start of static');
        Update.updateRasterFuncs.set(UpdateTypeEnum.PixelUpdate, (raster: Raster, props: unknown) => {
            const typedProps = props as PixelUpdateProps;

            const imageDataOffset = 4 * (typedProps.y * raster.width + typedProps.x);
            const red = Update.clamp(typedProps.red);
            const green = Update.clamp(typedProps.green);
            const blue = Update.clamp(typedProps.blue);

            raster.getBuffer()[imageDataOffset] = red;
            raster.getBuffer()[imageDataOffset + 1] = green;
            raster.getBuffer()[imageDataOffset + 2] = blue;

            // what if we did this as several blocks of arrays? for parallization?
        });
        console.log('TJTAG end of static');
    }

    private static clamp(val: number, min = 0, max = 255): number {
        if (val < min) {
            return min;
        } else if (val > max) {
            return max;
        } else {
            return val;
        }
    }
}
