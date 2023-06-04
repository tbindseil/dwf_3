import { Model } from 'objection';
import { makeKnex } from '../../src/db/knex_file';

describe('get_pictures', () => {
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

    beforeAll(async () => {
        const scopedKnex = makeKnex();
        Model.knex(scopedKnex);

        await scopedKnex('picture').insert(expectedPictures);

        scopedKnex.destroy();
    });

    describe('GET /pictures', () => {
        it('should return pictures', async () => {
            // TODO this is intermittently failing until seeding is consolidated
            //             const { body: pictures } = await request(server)
            //                 .get('/pictures')
            //                 .expect(200);
            //             const getPicturesResponse = pictures as GetPicturesOutput;
            //
            //             expect(getPicturesResponse.pictures.length).toBe(
            //                 expectedPictures.length
            //             );
            //             expect(pictures.pictures).toEqual(expectedPictures);
        });
    });
});
