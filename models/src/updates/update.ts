import {Raster} from 'dwf-3-raster-tjb';
import {v4 as uuidv4} from 'uuid';

export interface UpdateProps {
    filename: string;
    createdBy: string;
}

export abstract class Update {
    public readonly guid = uuidv4();
    public readonly filename: string;
    public readonly createdBy: string;

    constructor(props: UpdateProps) {
        this.filename = props.filename;
        this.createdBy = props.createdBy;
    }

    public abstract updateRaster(raster: Raster): void;
}
