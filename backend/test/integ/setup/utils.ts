import * as fs from 'fs';
import path from 'path';

const DEFAULT_FILE_NAME =
    '/Users/tj/Projects/dwf_3/pictures/user_created/DEFAULT_FILE_NAME.png';
const DEFAULT_FOLDER_NAME = '/Users/tj/Projects/dwf_3/pictures/user_created';
// ^this is duplicated and whack

export async function generateSamplePng(filename: string) {
    if (filename == DEFAULT_FILE_NAME.split('/').at(-1)) {
        throw Error(`cannot use ${DEFAULT_FILE_NAME}`);
    }

    await fs.promises.copyFile(
        DEFAULT_FILE_NAME,
        path.join(DEFAULT_FOLDER_NAME, filename),
        fs.constants.COPYFILE_EXCL
    );
}

export async function getPictureAsBuffer(filename: string): Promise<Buffer> {
    return await fs.promises.readFile(path.join(DEFAULT_FOLDER_NAME, filename));
}

export async function removePng(filename: string): Promise<void> {
    await fs.promises.unlink(path.join(DEFAULT_FOLDER_NAME, filename));
}
