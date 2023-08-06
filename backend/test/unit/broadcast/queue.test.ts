import { Queue } from '../../../src/broadcast/queue';

describe('Queue tests', () => {
    const queue = new Queue();

    // push when waiting starts things
    // push adds to a list that gets run
    // one job doesn't start util the previous has terminated
    // stops and waits after the last job completes
    // waitForCompletion returns once the last job is run

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
