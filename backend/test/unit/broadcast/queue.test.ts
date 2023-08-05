import { Queue } from '../../../src/broadcast/queue';

describe('Queue tests', () => {
    const queue = new Queue();

    it('pushes jobs', () => {
        queue.push(() => {
            return new Promise((resolve, reject) => {
                reject;

                console.log('do something!');
                resolve();
            });
        });
    });

    it('waits for completion', () => {
        queue.waitForCompletion();
        console.log('done');
    });
});
