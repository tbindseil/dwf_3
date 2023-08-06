import { Job, Queue } from '../../../src/broadcast/queue';
import { waitUntil } from '../mock/utils';

describe('Queue tests', () => {
    const queue = new Queue();

    afterEach(async () => {
        await queue.waitForCompletion();
    });

    it('runs the first job that is pushed', async () => {
        let condition = false;
        queue.push(() => {
            return new Promise((resolve, reject) => {
                reject;
                condition = true;
                resolve();
            });
        });

        const success = await waitUntil(() => condition, 1000, 1000);
        expect(success).toBe(true);
    });

    it('can push a bunch of asynchronous jobs', async () => {
        const job = async () => {
            await new Promise((r) => setTimeout(r, 100));
        };

        for (let i = 0; i < 5; ++i) {
            queue.push(job);
        }
    });

    it('serializes the jobs such that the next job does not start until the current job finishes', async () => {
        const writtenStrings: string[] = [];
        const expectedStrings: string[] = [];
        const jobs: Job[] = [];

        for (let i = 0; i < 5; ++i) {
            const startString = `start of job_${i}`;
            const endString = `end of job_${i}`;
            expectedStrings.push(startString, endString);

            const job = async () => {
                writtenStrings.push(startString);
                await new Promise((r) => setTimeout(r, 100));
                writtenStrings.push(endString);
            };
            jobs.push(job);
        }

        for (let i = 0; i < 5; ++i) {
            queue.push(jobs[i]);
        }

        await queue.waitForCompletion();

        expect(writtenStrings).toEqual(expectedStrings);
    });

    it('waits for completion', async () => {
        let condition = false;
        queue.push(async () => {
            await new Promise((r) => setTimeout(r, 500));
            condition = true;
        });

        expect(condition).toBe(false);

        await queue.waitForCompletion();

        expect(condition).toBe(true);
    });
});
