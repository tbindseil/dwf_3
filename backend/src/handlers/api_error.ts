export default class APIError extends Error {
    public readonly statusCode: number;
    public readonly message: string;

    constructor(statusCode: number, message: string) {
        /* c8 ignore next */
        super(message);
        Object.setPrototypeOf(this, APIError.prototype);

        this.statusCode = statusCode;
        this.message = message;
    }
}
