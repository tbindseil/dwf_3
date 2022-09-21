// TODO rename cause its more like request picture connection
export interface PutClientInput {
    filename: string
}

export interface PutClientOutput {
    width: number,
    height: number,
    data: Buffer
}
