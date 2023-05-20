import Jimp from 'jimp'

const jimp_read = Jimp.read

type JimpReadResult = ReturnType<typeof jimp_read>

interface JimpAdapter {
    createJimp: (w: number, h: number) => Jimp
    read: (path: string) => Promise<JimpReadResult>
}

export default class JimpAdapterImpl implements JimpAdapter {
    public createJimp(w: number, h: number): Jimp {
        return new Jimp(w, h)
    }

    public async read(path: string): Promise<JimpReadResult> {
        return await Jimp.read(path)
    }
}
