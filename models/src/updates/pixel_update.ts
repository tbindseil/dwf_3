import { Update } from './update';

export interface PixelUpdate extends Update {
    x: number,
    y: number,
    red: number,
    green: number,
    blue: number
}
