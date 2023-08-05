export type Job = () => Promise<void>;
export class Queue {
    private readonly waitForCompletionIntervalMS: number;
    private readonly jobs: Job[];

    public constructor(waitForCompletionIntervalMS: number) {
        this.waitForCompletionIntervalMS = waitForCompletionIntervalMS;
        this.jobs = [];
    }

    public push(job: Job): void {
        this.jobs.push(job);
        // ok, so we know that jobs is only shortened by runJob
        // and that only shortens explicitly after a job is done
        // that can't happen inbetween pushing above and starting below
        // so we know the condition (length === 1) is always indicative that we are restarting

        if (this.jobs.length === 1) {
            this.start();
        }
    }

    public async waitForCompletion(): Promise<void> {
        while (this.jobs.length > 0) {
            await this.delay(this.waitForCompletionIntervalMS);
        }
    }

    private start(): void {
        if (this.jobs.length !== 1) {
            console.error(
                `queue started with non-one jobs. this.jobs.length is: ${this.jobs.length}`
            );
            return;
        }

        this.runJob();
    }

    private async runJob(): Promise<void> {
        // need to peek here I think
        // basically, if we dequeue the last job and its a long running job
        // that will run asynchronously
        // and then we could enqueue a new job, start, dequeue that,
        const nextJob = this.jobs.at(0);

        if (!nextJob) {
            console.error('nextJob undefined');
            return;
        }

        await nextJob();

        this.jobs.shift();
        // ok, so what if we dequeue to get 0, then we finish
        // ok, so what if we dequeue to get 1, then we run it
        // there is no more release of control

        if (this.jobs.length > 0) {
            this.runJob();
        }
    }

    private delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
