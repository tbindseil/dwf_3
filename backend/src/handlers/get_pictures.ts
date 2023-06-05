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
        return (() => true) as unknown as ValidateFunction;
    }

    public async process(input: GetPicturesInput): Promise<GetPicturesOutput> {
        input;
        return {
            pictures: await Picture.query(),
        };
    }
}
