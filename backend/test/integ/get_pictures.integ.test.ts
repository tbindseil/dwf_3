import request from 'supertest';
import { Model } from 'objection'

import { makeKnex } from '../../src/db/knex_file';

import { server } from '../../src/app'
import {GetPicturesOutput} from 'dwf-3-models-tjb';

describe('get_pictures', () => {
    beforeAll(async () => {
        // might be the problem
        const scopedKnex = makeKnex();
        Model.knex(scopedKnex);
        // scopedKnex.destroy();
    })

    describe('GET /pictures', () => {
        it('should return pictures', async () => {
            // used to be request(app), maybe need to export app even if it is server that is started? so expoert server, app, and io
            const { body: pictures } = await request(server).get('/pictures').expect(200)
            const getPicturesResponse = pictures as GetPicturesOutput;

            // TODO can cast pictures to getPicturesResponse

            // TODO dry out here and seed
            // TODO more importantly, and deal with createdby vs createdBy ....
            const expectedPictures = [
                { id: 1, name: "name1", createdBy: "createdb1", filename: "filenam1", filesystem: "filesyste1" },
                { id: 2, name: "name2", createdBy: "createdb2", filename: "filenam2", filesystem: "filesyste2" },
                { id: 3, name: "name3", createdBy: "createdb3", filename: "filenam3", filesystem: "filesyste3" },
            ];

            expect(getPicturesResponse.pictures.length).toBe(expectedPictures.length);
            expect(pictures.pictures).toEqual(expectedPictures);
        })
    })
})
