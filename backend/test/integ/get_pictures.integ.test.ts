import request from 'supertest';
import Knex from 'knex'
import { Model } from 'objection'

import { knex } from '../setup'

import { io, server } from '../../src/app'

describe('get_pictures', () => {
    let seededBooks: any;

    beforeAll(async () => {
        Model.knex(knex)

        // Seed anything
//         seededBooks = await knex('book')
//             .insert([{ name: 'A Game of Thrones', author: 'George R. R. Martin' }])
//             .returning('*')
    })

    afterAll(() => {
        knex.destroy()
    })

    describe('GET /books/:id', () => {
        // Tests will go here
        it('does a test...', () => {
            console.log('TESTING BITCH');
        });

        it('should return a book', async () => {
            // used to be request(app), maybe need to export app even if it is server that is started? so expoert server, app, and io
            const { body: pictures } = await request(server).get('/pictures').expect(200)

            // TODO can cast pictures to getPicturesResponse

            console.log(`picture is: ${JSON.stringify(pictures)}`);
            // TODO dry out here and seed
            const expectedPictures = [
                { id: 1, name: "name1", createdby: "createdb1", filename: "filenam1", filesystem: "filesyste1" },
                { id: 2, name: "name2", createdby: "createdb2", filename: "filenam2", filesystem: "filesyste2" },
                { id: 3, name: "name3", createdby: "createdb3", filename: "filenam3", filesystem: "filesyste3" },
            ];

            // TODO right now, the app is using the pool, so it is calling in to the real database, not the test database. Thats the next step, gonna be an awseom morning of coding

            // expect(book).toBeObject()
            expect(pictures.length).toBe(expectedPictures.length);
            // expect(book.name).toBe('A Game of Thrones')
        })
    })
})
