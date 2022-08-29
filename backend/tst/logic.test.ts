import { logic } from '../src/logic';
 
describe('testing index file', () => {
    test('empty string should result in zero', () => {
        const url_tokens: string[] = [];
        let req = '';
        let res = '';
        logic(url_tokens, req, res);
        // expect(add('')).toBe(0);
    });
});
