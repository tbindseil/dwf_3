export async function stream_request(req: any): Promise<any> {
    const buffers: Uint8Array[] = [];

    for await (const chunk of req) {
        buffers.push(chunk);
    }

    const data = Buffer.concat(buffers).toString();
    try {
        return JSON.parse(data);
    } catch (error: any) {
        return {};
    }
}
