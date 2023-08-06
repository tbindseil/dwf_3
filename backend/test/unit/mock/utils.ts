export const waitUntil = async (
    conditionEvaluator: () => boolean,
    timeoutMS: number,
    intervalMS: number
): Promise<boolean> => {
    let totalWaitTimeMS = 0;
    while (true) {
        await new Promise((r) => setTimeout(r, intervalMS));
        totalWaitTimeMS += intervalMS;
        if (conditionEvaluator()) {
            return true;
        }
        if (totalWaitTimeMS > timeoutMS) {
            return false;
        }
    }
};

export const waitForMS = async (howLong: number): Promise<void> => {
    await new Promise((r) => setTimeout(r, howLong));
};
