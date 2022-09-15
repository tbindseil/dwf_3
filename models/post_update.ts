import { PixelUpdate } from './updates/pixel_update';

export interface PostUpdateInput {
    pixelUpdate: PixelUpdate // for now, need to figure out how to make this update with data payload
}

export interface PostUpdateOutput {
    msg: string;
}
