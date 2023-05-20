import { stream_request } from '../../src/stream_request';
import * as stream from 'stream';

describe('Test stream_request method', () => {
    it('Reads the stream, and turns it into a json object', async () => {
        const expectedObj = {
            name: 'test_name',
        };
        const s = stream.Readable.from([
            Buffer.from(JSON.stringify(expectedObj)),
        ]);
        const ret = await stream_request(s);
        expect(ret).toEqual(expectedObj);
    });

    it('handles empty string', async () => {
        const expectedObj = {};
        const s = stream.Readable.from([Buffer.from('')]);
        const ret = await stream_request(s);
        expect(ret).toEqual(expectedObj);
    });
});
