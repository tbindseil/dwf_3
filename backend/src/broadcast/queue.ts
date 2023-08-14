export type Job = () => Promise<void>;

// I wonder if this could be more
// flexible, pass in levels of priority
// save as member var
// use in for loops
// one is the highest priority
export enum Priority {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
    SIX = 6,
    MAX = SIX
}

export class Queue {
    private readonly waitForCompletionIntervalMS: number;
    private readonly jobs: Map<Priority, Job[]>;

    public constructor(waitForCompletionIntervalMS: number = 1000) {
        this.waitForCompletionIntervalMS = waitForCompletionIntervalMS;
        this.jobs = new Map();

        for (let i = Priority.ONE; i <= Priority.MAX; ++i) {
            this.jobs.set(i, []);
        }
    }

    public push(priority: Priority, job: Job): void {
        const jobList = this.jobs.get(priority);
        if (jobList) {
            jobList.push(job);
        }

        // ok, so we know that jobs is only shortened by runJob
        // and that only shortens explicitly after a job is done
        // that can't happen inbetween pushing above and starting below
        // so we know the condition (length === 1) is always indicative that we are restarting
        // if (this.jobs.length === 1) {
        if (this.getNumberOfJobs() === 1) {
            this.start();
        }
    }

    public async waitForCompletion(): Promise<void> {
        while (this.getNumberOfJobs() > 0) {
            await this.delay(this.waitForCompletionIntervalMS);
        }
    }

    private getNumberOfJobs(): number {
        let numberOfJobs = 0;
        this.jobs.forEach(jobs => numberOfJobs += jobs.length);
        return numberOfJobs;
    }

    private start(): void {
        /* c8 ignore start */
        if (this.getNumberOfJobs() !== 1) {
            console.error(
                `queue started with non-one jobs. this.getNumberOfJobs is: ${this.getNumberOfJobs()}`
            );
            return;
        }
        /* c8 ignore stop */

        this.runJobs();
    }

    private async runJobs(): Promise<void> {
        while (this.getNumberOfJobs() > 0) {
            for (let i = Priority.ONE; i <= Priority.MAX; ++i) {
                const currentPriorityJobs = this.jobs.get(i);
                if (currentPriorityJobs) {
                    if (currentPriorityJobs.length > 0) {
                        const nextJob = currentPriorityJobs.at(0);

                        /* c8 ignore start */
                        if (!nextJob) {
                            console.error('nextJob undefined');
                            return;
                        }
                        /* c8 ignore stop */

                        await nextJob();

                        currentPriorityJobs.shift();

                        // break out of for loop to pick the highest available job as the next job
                        break;
                    }
                }
            }
        }
    }

    private async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
