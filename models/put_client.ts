// TODO rename cause its more like request picture connection
export interface PutClientInput {
    ipAddress: string,
    filename: string
}

export interface PutClientOutput {
    msg: string;
    buffer: any;
}
