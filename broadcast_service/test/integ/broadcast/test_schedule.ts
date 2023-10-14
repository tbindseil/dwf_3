import { server } from '../../../src/app';
import request from 'supertest';

import { PostPictureInput, PictureDatabaseShape } from 'dwf-3-models-tjb';
import { ClientScript, makeRandomClientScript } from './client_script';

import fs from 'fs';

import {
    MAX_CLIENTS_PER_PICTURE,
    MAX_CLIENT_ACTIONS,
    PICTURE_WIDTH,
    PICTURE_HEIGHT,
    randomNumberBetweenZeroAnd,
} from './misc';
import { Test, verifications } from './tests';

interface PictureCreationData {
    name: string;
    createdBy: string;
    width: number;
    height: number;
}

export class TestSchedule {
    private static async makeTestSchedule(
        clientScriptsPerRound: ClientScript[][]
    ): Promise<TestSchedule> {
        const pictureFilenames = await this.initializePictures(
            clientScriptsPerRound.length
        );
        const pictureScripts = new Map<string, ClientScript[]>();
        pictureFilenames.forEach((filename, index) =>
            pictureScripts.set(filename, clientScriptsPerRound[index])
        );
        return new TestSchedule(pictureScripts);
    }

    private constructor(
        private readonly pictureScripts: Map<string, ClientScript[]>
    ) {}

    public async runTests(): Promise<void> {
        const executions: Promise<void>[] = [];

        this.pictureScripts.forEach(
            (clientScripts: ClientScript[], filename: string) => {
                const test = new Test(clientScripts, filename, verifications);
                executions.push(test.run());
            }
        );

        await Promise.all(executions);
    }

    public async toFile() {
        const scriptsSansFilenames = Array.from(this.pictureScripts.values());
        const createdAt = new Date().toString().replaceAll(' ', '__');
        await fs.promises.writeFile(
            `savedTestSchedule_${createdAt}`,
            JSON.stringify(scriptsSansFilenames)
        );
    }

    public static async fromFile(
        testScheduleFile: string
    ): Promise<TestSchedule> {
        const recoveredClientScriptsPerRound: ClientScript[][] = JSON.parse(
            '' + (await fs.promises.readFile(testScheduleFile))
        );

        return await this.makeTestSchedule(recoveredClientScriptsPerRound);
    }

    public static async makeRandomTestSchedule(
        numRounds: number
    ): Promise<TestSchedule> {
        const randomClientScriptsPerRound: ClientScript[][] = [];
        for (let i = 0; i < numRounds; ++i) {
            const clientsInThisRound = randomNumberBetweenZeroAnd(
                MAX_CLIENTS_PER_PICTURE
            );

            const clientScripts: ClientScript[] = [];
            for (let j = 0; j < clientsInThisRound; ++j) {
                clientScripts.push(
                    makeRandomClientScript(
                        randomNumberBetweenZeroAnd(MAX_CLIENT_ACTIONS)
                    )
                );
            }
            randomClientScriptsPerRound.push(clientScripts);
        }

        const testSchedule = await this.makeTestSchedule(
            randomClientScriptsPerRound
        );
        await testSchedule.toFile();
        return testSchedule;
    }

    private static async initializePictures(
        numRounds: number
    ): Promise<string[]> {
        const testPictures: PictureCreationData[] = [];
        for (let i = 0; i < numRounds; ++i) {
            testPictures.push({
                name: `picture_${i}`,
                createdBy: 'created_for_test',
                width: PICTURE_WIDTH,
                height: PICTURE_HEIGHT,
            });
        }

        // create a picture and make sure its there
        for (let i = 0; i < numRounds; ++i) {
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
        expect(pictures.pictures.length).toEqual(numRounds);

        const pictureFilenames: string[] = [];
        pictures.pictures.forEach((p: PictureDatabaseShape) =>
            pictureFilenames.push(p.filename)
        );

        return pictureFilenames;
    }
}
