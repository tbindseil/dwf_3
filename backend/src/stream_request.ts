export async function stream_request(req: any): Promise<any> {
    const buffers: Uint8Array[] = [];

    for await (const chunk of req) {
        buffers.push(chunk);
    }

    const data = Buffer.concat(buffers).toString();
    return JSON.parse(data);
}
