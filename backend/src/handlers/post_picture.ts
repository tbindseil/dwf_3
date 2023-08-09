import {
    Picture,
    PostPictureInput,
    PostPictureOutput,
    _schema,
} from 'dwf-3-models-tjb';
import API from './api';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { ValidateFunction } from 'ajv';
import { Knex } from 'knex';
import { performance } from 'perf_hooks';

// hmm, when a picture is created, it can take a bit of time
// so how do i keep it "blocked" while its being created?
// 1. status field in the DB
// 2. can't navigate there until its done?
// 3. dont put it in database till its ready
export class PostPicture extends API<PostPictureInput, PostPictureOutput> {
    private pictureAccessor: PictureAccessor;

    public provideInputValidationSchema(): ValidateFunction {
        const ret = this.ajv.compile(_schema);
        return ret;
    }

    constructor(pictureAccessor: PictureAccessor) {
        super();
        this.pictureAccessor = pictureAccessor;
    }

    public async process(
        input: PostPictureInput,
        knex: Knex
    ): Promise<PostPictureOutput> {
        const name = input.name;
        const createdBy = input.createdBy;

        const filesystem = this.pictureAccessor.getFileSystem();
        console.log(`TJTAG start createNewPicture @ ${performance.now()}`);
        const filename = await this.pictureAccessor.createNewPicture(
            name,
            createdBy,
            input.width,
            input.height
        );
        console.log(`TJTAG end createNewPicture @ ${performance.now()}`);

        await Picture.query(knex).insert({
            name: name,
            createdBy: createdBy,
            filename: filename,
            filesystem: filesystem,
        });

        return {
            msg: 'picture successfully created',
        };
    }
}
