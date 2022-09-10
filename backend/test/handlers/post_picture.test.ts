import { PostPicture } from '../../src/handlers/post_picture';
import APIError from '../../src/handlers/api_error';
import * as db from '../../src/db';

jest.mock('../../src/db');
const mockQuery = jest.mocked(db.query, true);

describe('PostPicture Tests', () => {
    const name = 'name';

    let postPicture: PostPicture;

    beforeEach(() => {
        postPicture = new PostPicture();
        mockQuery.mockClear();
    });

    it('gets the name from the input', () => {
        const body = { name: name };
        const returned = postPicture.getInput(body);
        expect(returned).toEqual({ name: name });
    });

    it('throws when input doesn\'t have a name field', async () => {
        expect(() => postPicture.getInput({})).toThrow(new APIError(400, 'name not provided, picture not created'));
    });

    it('calls db query when procesing', () => {
        postPicture.process({name: name});

        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(`insert into test_auto_increment (name) values ($1);`, [name]);
    });

    it('throws an api error when the database query fails', async () => {
        mockQuery.mockImplementation((query: string, params: any[]) => { query; params; throw new Error(); });
        await expect(postPicture.process({name: name})).rejects.toThrow(new APIError(500, 'database issue, picture not created'));
    });
});
