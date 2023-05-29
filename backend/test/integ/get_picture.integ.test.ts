import { Model } from 'objection';
import request from 'supertest';

import { makeKnex } from '../../src/db/knex_file';

import { GetPictureInput, GetPictureOutput } from 'dwf-3-models-tjb';
import { server } from '../../src/app';
import {
    generateSamplePng,
    getPictureAsBuffer,
    removePng,
} from './setup/utils';

describe('get_picture', () => {
    // TODO deal rename createdby to created_by and introduce a camel to snake decoder
    // probably overkill, but could be cool:
    // https://stackoverflow.com/questions/42549842/modify-column-datatype-in-knex-migration-script
    // if this is a big deal, i gotta tack on a linter
    const expectedPicture = [
        {
            id: 4, // TODO need a concerted effort on seeding, maybe a registration system, returning the id of the inserted pictures
            name: 'name1',
            createdBy: 'createdb1',
            filename: 'filenam1',
            filesystem: 'filesyste1',
        },
    ].map((pic) => {
        return {
            id: pic.id,
            name: pic.name,
            createdby: pic.createdBy,
            filename: pic.filename,
            filesystem: pic.filesystem,
        };
    })[0];

    beforeAll(async () => {
        generateSamplePng(expectedPicture.filename);

        const scopedKnex = makeKnex();
        Model.knex(scopedKnex);

        await scopedKnex('picture').insert(expectedPicture);

        scopedKnex.destroy();
    });

    describe('GET /picture', () => {
        it('should return picture', async () => {
            const payload: GetPictureInput = {
                id: expectedPicture.id,
            };
            const { body: picture } = await request(server)
                .get('/picture')
                .send(payload)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .expect(200);
            const getPictureResponse = picture as GetPictureOutput; // TODO this typing thing seems to repeat

            const expectedBuffer = await getPictureAsBuffer(
                expectedPicture.filename
            );
            expect(getPictureResponse).toEqual(expectedBuffer);
        });

        it('should return 4XX when input is unfitting', async () => {
            const payload = {
                not_id: expectedPicture.id,
            };
            await request(server)
                .get('/picture')
                .send(payload)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .expect(400);
        });
    });

    afterAll(async () => {
        await removePng(expectedPicture.filename);
    });
});
