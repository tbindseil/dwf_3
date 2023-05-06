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
        seededBooks = await knex('book')
            .insert([{ name: 'A Game of Thrones', author: 'George R. R. Martin' }])
            .returning('*')
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
            const id = seededBooks[0].id

            // used to be request(app), maybe need to export app even if it is server that is started? so expoert server, app, and io
            const { body: book } = await request(server).get(`/books/${id}`).expect(200)

            // expect(book).toBeObject()
            expect(book.id).toBe(id)
            expect(book.name).toBe('A Game of Thrones')
        })
    })
})
