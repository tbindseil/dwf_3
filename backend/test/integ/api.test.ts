import request from 'supertest';
import {
    GetPictureInput,
    GetPictureOutput,
    PostPictureInput,
} from 'dwf-3-models-tjb';
import { server } from '../../src/app';
import { generateSamplePng, getPictureAsBuffer } from './setup/utils';

describe('happy case', () => {
    const expectedPictures = [
        {
            id: 1,
            name: 'name1',
            createdBy: 'createdb1',
            filename: 'filenam1',
            filesystem: 'filesyste1',
        },
        {
            id: 2,
            name: 'name2',
            createdBy: 'createdb2',
            filename: 'filenam2',
            filesystem: 'filesyste2',
        },
        {
            id: 3,
            name: 'name3',
            createdBy: 'createdb3',
            filename: 'filenam3',
            filesystem: 'filesyste3',
        },
    ];

    it('creates a couple pictures, gets all, then gets an individual picture', async () => {
        // expect 0 pictures initially
        const { body: intialPictures } = await request(server)
            .get('/pictures')
            .expect(200);
        expect(intialPictures.pictures.length).toEqual(0);

        // post a few pictures
        for (const picture of expectedPictures) {
            const payload: PostPictureInput = {
                name: picture.name,
                createdBy: picture.createdBy,
            };
            await request(server)
                .post('/picture')
                .send(payload)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .expect(200);
        }

        // look at all posted pictures
        const { body: pictures } = await request(server)
            .get('/pictures')
            .expect(200);
        expect(pictures.pictures.length).toEqual(expectedPictures.length);

        // set up to get an individual picture
        const expectedPicture = expectedPictures[0];
        generateSamplePng(expectedPicture.filename);

        // get an individual picture, buffer and all
        const payload: GetPictureInput = {
            id: expectedPicture.id,
        };
        const { body: picture } = await request(server)
            .get('/picture')
            .send(payload)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200);
        const getPictureResponse = picture as GetPictureOutput;
        const expectedBuffer = await getPictureAsBuffer(
            expectedPicture.filename
        );
        expect(getPictureResponse).toEqual(expectedBuffer);
    });
});
