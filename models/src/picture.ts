import { Model, ModelObject } from 'objection';

export default class Picture extends Model {
    id!: number;
    name!: string;
    createdBy!: string;
    filename!: string;
    filesystem!: string;

    static tableName = 'picture';
}

export type PictureDatabaseShape = ModelObject<Picture>;
