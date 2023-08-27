import { Update, UpdateProps, UpdateTypeEnum } from './update';

// Ok
// this is getting weird, if i send Update,
// how will the other side know what type of Update
// it is?
//
// one thought
// each update is just a set of properties and an updateRaster function
// so, each SerializedUpdate could be a a props object (union of each differnt props type)
// and an enum value.
//
// The enum acts to determine which updateRaster function is called
// and which props
//
// i could potentially use the schema validation here, but that could be slow
// maybe i do it in the back ground?
//
// i guess i should verify if polymorphism is respected here
// but even if so, how to create a new SpecificUpdate? the functions are gone
//
// so i just need to make sure i get PixelUpdate fields when its Update
//
// so it does respect polymorphism when sending fields, ie, a PixelUpdate
// broadcast to a typed broadcast for Update will astill have all these fields
//
// so, I think i will utilize an enum in each as an index into a static array of funcs
// (think super(UpdateTypeEnum.SpecificEnum, filename, createdBy)
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
