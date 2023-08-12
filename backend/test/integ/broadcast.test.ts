import { PixelUpdate } from 'dwf-3-models-tjb';

const PICTURE_WIDTH = 800;
const PICTURE_HEIGHT = 1000;

describe('broadcast test', () => {

  beforeEach(() => {

  });

  it('runs the test', () => {
    const numClients = 3;
    const numUpdates = [ 4, 1, 6];
    testsFromRandom(numClients, numUpdates);
  });
});

export const testsFromFile = (previousUpdatesFilename?: string) => {
  let updates: Update[][] = recoverUpdates(previousUpdatesFilename);
  // do it in here
  tests(updates)
}

export const testsFromRandom = (numClients: number, numUpdates: number[]) => {
  let updates: Update[][] = [];
  for (let i = 0; i < numClients; ++i) {
    for (let j = 0; j < numUpdates.get(i); ++j) {
      updates.push(makeRandomUpdate());
    }
  }
  tests(updates);
}

const tests = (updates: Update[][]) => {
  // write first incase we crash
  writeToFile(JSON.stringify(updates), 'savedUpdates.json' + timestamp);

  const clients = Promise<void>[];
  updates.forEach(updates => {
    clients.push(spawnClient(updates));
  }

  Promise.awaitAll(clients);

  // TODO await...


  // do we want to kick them all off?
  // naw, let that be part of the randomness for now
  // TODO instead, more complicated, repeat them
}

import { io } from 'socket.io-client';
const ENDPOINT = 'http://127.0.0.1:6543/';

connectAsClient() {
  return io(ENDPOINT);
}

async spawnClient(updates: Update[]): Promise<void> {
  const socket = connectAsClient()

  console.log(`spawning client with socketId: ${socket.id}`);

  // need to forloop to serialize these
  for (let i = 0; i < updates.lenth; ++i) {
    let u = updates[i];
    socket.emit('client_to_server_udpate', u.pixelUpdate);
    await delay(u.waitTimeMS);
  }

  // TODO is this the right call?
  socket.close();
}

interface Update {
  waitTimeMS: number;
  pixelUpdate: PixelUpdate;
}

const makeRandomUpdate = (clientNum: number): Update => {
  const waitTimeMS = randomNumberBetweenZeroAnd(100);
  const pixelUpdate = {
    x: randomNumberBetweenZeroAnd(PICTURE_WIDTH),
    y: randomNumberBetweenZeroAnd(PICTURE_HEIGHT),
    red: randomNumberBetweenZeroAnd(255),
    green: randomNumberBetweenZeroAnd(255),
    blue: randomNumberBetweenZeroAnd(255),
    filename: filename, 
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

const delay = (ms: number) => {
    await new Promise((r) => setTimeout(r, ms));
}
