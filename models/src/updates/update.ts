import {v4 as uuidv4} from 'uuid';

export abstract class Update {
    public readonly guid = uuidv4();
    private readonly filename: string;
    private readonly createdBy: string;

    constructor(filename: string, createdBy: string) {
        this.filename = filename;
        this.createdBy = createdBy;
    }

    public abstract updateRaster(raster: Raster): void;
}
