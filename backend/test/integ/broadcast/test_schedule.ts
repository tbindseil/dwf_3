import { server } from '../../../src/app';
import request from 'supertest';

import { PostPictureInput, PictureDatabaseShape } from 'dwf-3-models-tjb';
import { ClientScript, makeRandomClientScript } from './client_script';

import fs from 'fs';
import { Client } from './client';

import {
    MAX_CLIENTS_PER_PICTURE,
    MAX_CLIENT_ACTIONS,
    NUM_PICTURES,
    PICTURE_WIDTH,
    PICTURE_HEIGHT,
} from './constants';
import { tests } from './tests';

export class TestSchedule {
    private readonly pictureScripts: Map<string, ClientScript[]>;

    private constructor(pictureScripts: Map<string, ClientScript[]>) {
        this.pictureScripts = pictureScripts;
    }

    public getClientScripts(filename: string): ClientScript[] {
        const clientScripts = this.pictureScripts.get(filename);
        if (!clientScripts) {
            throw Error(`no scripts for filename: ${filename}`);
        }
        return clientScripts;
    }

    public async toFile() {
        // well what's interesting is that the filename isn't consistent accross runs
        // so we just need to keep the ClientScripts grouped together
        // so we could probably just group them into an array of arrays
        const scriptsSansFilenames: ClientScript[][] = [];
        Array.from(this.pictureScripts.values()).forEach((scripts) =>
            scriptsSansFilenames.push(scripts)
        );
        const createdAt = new Date().toString().replaceAll(' ', '__');
        await fs.promises.writeFile(
            `savedTestSchedule_${createdAt}`,
            JSON.stringify(scriptsSansFilenames)
        );
    }

    public static async fromFile(
        testScheduleFile: string
    ): Promise<TestSchedule> {
        // TODO maybe could associate types per round? rihgt now its implicit that
        // there are m x n updates where m is concurrent pictures and n is types of test
        // assuming one type of each test per round basically.
        const scriptsSansFilenames: ClientScript[][] = JSON.parse(
            '' + (await fs.promises.readFile(testScheduleFile))
        );

        const pictureFilenames = await this.initializePictures(
            scriptsSansFilenames.length * tests.length
        );

        const pictureScripts = new Map<string, ClientScript[]>();
        let pictureFilenamesIndex = 0;
        for (let i = 0; i < scriptsSansFilenames.length; ++i) {
            pictureScripts.set(
                pictureFilenames[pictureFilenamesIndex++],
                scriptsSansFilenames[i]
            );
        }
        // this compromises further stuff

        // each schedule runs through all tests, so we have to apply them multiple times

        // updates have the picture they are applied to as part of their model
        // TODO probably a code smell here, make sure there is a note to address
        pictureScripts.forEach((scripts: ClientScript[], filename: string) => {
            scripts.forEach((script) => {
                script.filename = filename;
                script.actions.map((a) => {
                    return {
                        postActionWaitMS: a.postActionWaitMS,
                        pixelUpdate: {
                            ...a.pixelUpdate,
                            filename: filename,
                        },
                    };
                });
            });
        });

        return new TestSchedule(pictureScripts);
    }

    public static async makeRandomTestSchedule(
        numPictures: number
    ): Promise<TestSchedule> {
        const pictureScripts = await this.initializePictures(numPictures);

        pictureScripts.forEach((clientScripts, filename) => {
            const clientsInThisPicture = Client.randomNumberBetweenZeroAnd(
                MAX_CLIENTS_PER_PICTURE
            );

            for (let j = 0; j < clientsInThisPicture; ++j) {
                clientScripts.push(
                    makeRandomClientScript(
                        filename,
                        `${filename}__client_${j}`,
                        Client.randomNumberBetweenZeroAnd(MAX_CLIENT_ACTIONS)
                    )
                );
            }

            pictureScripts.set(filename, clientScripts);
        });

        const randomTestSchedule = new TestSchedule(pictureScripts);
        randomTestSchedule.toFile();
        return randomTestSchedule;
    }

    private static async initializePictures(
        numPictures: number
    ): Promise<string[]> {
        const testPictures: any[] = [];
        for (let i = 0; i < numPictures; ++i) {
            testPictures.push({
                name: `picture_${i}`,
                createdBy: 'created_for_test',
                width: PICTURE_WIDTH,
                height: PICTURE_HEIGHT,
            });
        }

        // create a picture and make sure its there
        for (let i = 0; i < NUM_PICTURES; ++i) {
            const testPicture = testPictures[i];
            const payload: PostPictureInput = {
                name: testPicture.name,
                createdBy: testPicture.createdBy,
                width: testPicture.width,
                height: testPicture.height,
            };

            await request(server)
                .post('/picture')
                .send(payload)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .expect(200);
        }

        // look at all posted pictures
        const { body: pictures } = await request(server)
            .get('/pictures')
            .expect(200);
        expect(pictures.pictures.length).toEqual(NUM_PICTURES);

        const pictureScripts: string[] = [];
        pictures.pictures.forEach((p: PictureDatabaseShape) =>
            pictureScripts.push(p.filename)
        );

        return pictureScripts;
    }
}
