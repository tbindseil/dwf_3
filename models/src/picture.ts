import { Model, ModelObject } from 'objection';

export default class Picture extends Model {
    id!: number;
    name!: string;
    created_by!: string;
    filename!: string;
    filesystem!: string;

    static tableName = 'picture';
}

export type PictureShape = ModelObject<Picture>;
