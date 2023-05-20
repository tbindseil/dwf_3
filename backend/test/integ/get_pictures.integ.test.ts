import request from 'supertest'
import { Model } from 'objection'

import { makeKnex } from '../../src/db/knex_file'

import { server } from '../../src/app'
import { GetPicturesOutput } from 'dwf-3-models-tjb'

describe('get_pictures', () => {
    // TODO deal rename createdby to created_by and introduce a camel to snake decoder
    // if this is a big deal, i gotta tack on a linter
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
    ]

    beforeAll(async () => {
        const scopedKnex = makeKnex()
        Model.knex(scopedKnex)

        await scopedKnex('picture').insert(
            expectedPictures.map((pic) => {
                return {
                    id: pic.id,
                    name: pic.name,
                    createdby: pic.createdBy,
                    filename: pic.filename,
                    filesystem: pic.filesystem,
                }
            })
        )

        scopedKnex.destroy()
    })

    describe('GET /pictures', () => {
        it('should return pictures', async () => {
            const { body: pictures } = await request(server)
                .get('/pictures')
                .expect(200)
            const getPicturesResponse = pictures as GetPicturesOutput

            expect(getPicturesResponse.pictures.length).toBe(
                expectedPictures.length
            )
            expect(pictures.pictures).toEqual(expectedPictures)
        })
    })
})
