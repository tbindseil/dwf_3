import { ClientScript, makeRandomClientScript } from './client_script';

import fs from 'fs';
import { Client } from './client';

import { MAX_CLIENTS_PER_PICTURE, MAX_CLIENT_ACTIONS } from './constants';

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
        testScheduleFile: string,
        pictureFilenames: string[]
    ): Promise<TestSchedule> {
        const scriptsSansFilenames: ClientScript[][] = JSON.parse(
            '' + (await fs.promises.readFile(testScheduleFile))
        );

        // TODO NUM_PICTURES is kinda tied in here
        // see: test schedule should determine the initial picture creation
        // so, test schedule has initialize pictures function
        // which is
        // const prefix = 'test_picture_'
        // for
        if (scriptsSansFilenames.length !== pictureFilenames.length) {
            throw Error(
                `recovered ${scriptsSansFilenames.length} sets of updates but expected ${pictureFilenames.length}`
            );
        }

        const pictureScripts = new Map<string, ClientScript[]>();
        for (let i = 0; i < scriptsSansFilenames.length; ++i) {
            pictureScripts.set(pictureFilenames[i], scriptsSansFilenames[i]);
        }

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

    public static makeRandomTestSchedule(filenames: string[]): TestSchedule {
        const pictureScripts = new Map<string, ClientScript[]>();

        filenames.forEach((filename) => {
            const clientsInThisPicture = Client.randomNumberBetweenZeroAnd(
                MAX_CLIENTS_PER_PICTURE
            );

            const clientScripts: ClientScript[] = [];
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
}
