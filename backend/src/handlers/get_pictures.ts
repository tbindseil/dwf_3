import {
    GetPicturesInput,
    GetPicturesOutput,
    Picture,
    _schema,
} from 'dwf-3-models-tjb';
import API from './api';
import { ValidateFunction } from 'ajv';

export class GetPictures extends API<GetPicturesInput, GetPicturesOutput> {
    public provideInputValidationSchema(): ValidateFunction {
        return this.ajv.compile(_schema.GetPictureInput);
    }

    public async process(input: GetPicturesInput): Promise<GetPicturesOutput> {
        input;

        const result = await Picture.query();

        // This will return with created_by instead of with createdBy
        // maybe that's ok, this commit removes code that translate between
        // the two, but I think that the benefits of finding a place for
        // it outweigh the difficulties.
        return {
            pictures: result,
        };
    }
}
