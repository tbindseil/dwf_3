import { Router } from '../src/router';
 
// so tests are:
// add a method, it should be callable
// after calling a method, res should be written
// call a method without it beign added, should be error case

describe('testing routing logic', () => {
    test('empty string should result in zero', () => {
        const url_tokens: string[] = [];
        let req = '';
        let res = '';
        // logic(url_tokens, req, res);
        // expect(add('')).toBe(0);
    });
});

