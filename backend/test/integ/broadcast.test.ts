import request from 'supertest';
import * as fs from 'fs';

import { io as io_package } from 'socket.io-client';

import { PixelUpdate, PostPictureInput } from 'dwf-3-models-tjb';
import { io, server } from '../../src/app';

const ENDPOINT = 'http://127.0.0.1:6543/';

const PICTURE_WIDTH = 800;
const PICTURE_HEIGHT = 1000;

interface Update {
  waitTimeMS: number;
  pixelUpdate: PixelUpdate;
}

// TODO this needs to be dried out
io.listen(6543);
const port = process.env.PORT || 8080;
// maybe i want to run this in a separate process since node is single threaded
server.listen(port, () => {
    // TODO wait until server is running
    console.log(`Listening on port ${port}`);
});

describe('broadcast test', () => {
  let testFilename: string;
  const testPicture = {
    name: 'name',
    createdBy: 'createdBy',
    width: PICTURE_WIDTH,
    height: PICTURE_HEIGHT
  }

  beforeEach(async () => {
    // create a picture and make sure its there
    const payload: PostPictureInput = {
      name: testPicture.name,
      createdBy: testPicture.createdBy,
      width: testPicture.width,
      height: testPicture.height
    };

    await request(server)
    .post('/picture')
    .send(payload)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(200);


    // look at all posted pictures
    const { body: pictures } = await request(server)
    .get('/pictures')
    .expect(200);
    expect(pictures.pictures.length).toEqual(1);

    testFilename = pictures.pictures[0].filename;
  });

  it('runs the test', async () => {
    const numClients = 3;
    const numUpdates = [ 4, 1, 6];
    await testsFromRandom(numClients, numUpdates);
  });

  const testsFromFile = async (previousUpdatesFilename: string) => {
    // unverified
    const recoveredUpdatesStr = await fs.promises.readFile(previousUpdatesFilename);
    const recoveredUpdates = JSON.parse('' + recoveredUpdatesStr);
    tests(recoveredUpdates);
  }

  const testsFromRandom = async (numClients: number, numUpdates: number[]) => {
    let updates: Update[][] = [];
    for (let i = 0; i < numClients; ++i) {
      updates.push([]);
      for (let j = 0; j < numUpdates[i]; ++j) {
        updates[i].push(makeRandomUpdate(i));
      }
    }
    await tests(updates);
  }

  const tests = async (updates: Update[][]) => {
    // write first incase we crash
    // unverified
    const createdAt = new Date().toString().replaceAll(' ', '__');
    await fs.promises.writeFile(`savedTestUpdates_${createdAt}`, JSON.stringify(updates));

    const clients: Promise<void>[] = [];
    updates.forEach(updates => {
      clients.push(spawnClient(updates));
    })

    await Promise.all(clients);

    // TODO verify that all clients received updates in the correct order


    // do we want to kick them all off?
    // naw, let that be part of the randomness for now
    // TODO instead, more complicated, repeat them
  }

  const spawnClient = async (updates: Update[]): Promise<void> => {
    const socket = io_package(ENDPOINT);

    console.log(`spawning client with socketId: ${socket.id}`);

    // need to forloop to serialize these
    for (let i = 0; i < updates.length; ++i) {
      let u = updates[i];
      socket.emit('client_to_server_udpate', u.pixelUpdate);
      await delay(u.waitTimeMS);
    }

    socket.close();
  }

  const makeRandomUpdate = (clientNum: number): Update => {
    const waitTimeMS = randomNumberBetweenZeroAnd(100);
    const pixelUpdate = {
      x: randomNumberBetweenZeroAnd(PICTURE_WIDTH),
      y: randomNumberBetweenZeroAnd(PICTURE_HEIGHT),
      red: randomNumberBetweenZeroAnd(255),
      green: randomNumberBetweenZeroAnd(255),
      blue: randomNumberBetweenZeroAnd(255),
      filename: testFilename,
      createdBy: `client_${clientNum}`
    }

    return {
      waitTimeMS,
      pixelUpdate
    };
  }

  const randomNumberBetweenZeroAnd = (high: number): number => {
    return Math.floor(high * Math.random());
  }

  const delay = async (ms: number) => {
    await new Promise((r) => setTimeout(r, ms));
  }
});
