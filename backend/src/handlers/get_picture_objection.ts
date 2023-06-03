import { GetPictureInput, GetPictureOutput, _schema } from 'dwf-3-models-tjb';
import API from './api';
import APIError from './api_error';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { NextFunction } from 'express';
import { ValidateFunction } from 'ajv';
import PictureObjectionModel from './picture_objection_model';

export class GetPictureObjection extends API<
    GetPictureInput,
    GetPictureOutput
> {
    private readonly pictureAccessor: PictureAccessor;

    constructor(pictureAccessor: PictureAccessor) {
        super();

        this.pictureAccessor = pictureAccessor;
    }

    public provideInputValidationSchema(): ValidateFunction {
        return this.ajv.compile(_schema.GetPictureInput);
    }

    public async process(
        input: GetPictureInput,
        next: NextFunction
    ): Promise<GetPictureOutput> {
        next;

        const query = PictureObjectionModel.query().findById(input.id);
        const filename = (await query)?.filename;

        if (!filename) {
            return this.handleError(
                new APIError(400, 'picture not found'),
                next
            );
        }

        // TODO I think all api process methods throw 500 in their bodies, coudl be 500 by default
        return await this.pictureAccessor.getPicture(filename);
    }

    public getContentType(): string {
        return 'image/png';
    }

    public serializeOutput(output: GetPictureOutput): Buffer {
        return output;
    }
}
