import * as fs from 'fs';
import path from 'path';

export const ENDPOINT = 'http://127.0.0.1:6543/';

// this is setup in src/app.ts and there is a TO DO in the integ/
// api.test.ts file noting to do an app config
const TEST_PICTURE_FOLDER_NAME =
    '/Users/tj/Projects/dwf_3/pictures/user_created/test/';

//export async function generateSamplePng(filename: string) {
//    if (filename == DEFAULT_FILE_NAME.split('/').at(-1)) {
//        throw Error(`cannot use ${DEFAULT_FILE_NAME}`);
//    }
//
//    await fs.promises.copyFile(
//        DEFAULT_FILE_NAME,
//        path.join(DEFAULT_FOLDER_NAME, filename),
//        fs.constants.COPYFILE_EXCL
//    );
//}
//
//export async function getPictureAsBuffer(filename: string): Promise<Buffer> {
//    return await fs.promises.readFile(path.join(DEFAULT_FOLDER_NAME, filename));
//}

export async function removeAllPng(): Promise<void> {
    (await fs.promises.readdir(TEST_PICTURE_FOLDER_NAME)).forEach((f) => {
        removePng(f);
    });
}

async function removePng(filename: string): Promise<void> {
    await fs.promises.unlink(path.join(TEST_PICTURE_FOLDER_NAME, filename));
}
