import { Update, UpdateProps, UpdateTypeEnum } from './update';

export interface PixelUpdateProps extends UpdateProps {
    x: number;
    y: number;
    red: number;
    green: number;
    blue: number;
}

export class PixelUpdate extends Update {
    public readonly x: number;
    public readonly y: number;
    public readonly red: number;
    public readonly green: number;
    public readonly blue: number;

    public constructor(props: PixelUpdateProps) {
        super(UpdateTypeEnum.PixelUpdate, props);
        this.x = props.x;
        this.y = props.y;
        this.red = props.red;
        this.green = props.green;
        this.blue = props.blue;
    }

}
