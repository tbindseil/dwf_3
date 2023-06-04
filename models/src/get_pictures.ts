import { PictureDatabaseShape } from './picture';

export interface GetPicturesInput {}

export interface GetPicturesOutput {
    pictures: PictureDatabaseShape[];
}
