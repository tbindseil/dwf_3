import request from 'supertest';
import {
    PictureDatabaseShape,
    PictureResponse,
    PostPictureInput,
} from 'dwf-3-models-tjb';
import { io, server } from '../../src/app';
import { io as io_package } from 'socket.io-client';
import { Raster } from 'dwf-3-raster-tjb';
import { performance } from 'perf_hooks';

// the actual program cant be running or there is a collision on the port
// TODO use a new port, or more generally organize startup and ports and stuff
io.listen(6543);
const port = process.env.PORT || 8080;
server.listen(port, () => {
    // TODO wait until server is running
    console.log(`Listening on port ${port}`);
});

describe('happy case', () => {
    // I'm using dummy names but actual names are being used
    // so i have to get things more like they are in standard application operation
    const expectedPictures = [
        {
            id: 1,
            name: 'name1',
            createdBy: 'createdb1',
            filename: 'filenam1',
            filesystem: 'filesyste1',
        },
        {
            id: 2,
            name: 'name2',
            createdBy: 'createdb2',
            filename: 'filenam2',
            filesystem: 'filesyste2',
        },
        {
            id: 3,
            name: 'name3',
            createdBy: 'createdb3',
            filename: 'filenam3',
            filesystem: 'filesyste3',
        },
    ];

    it('creates a couple pictures, gets all, then gets an individual picture', async () => {
        // expect 0 pictures initially
        const { body: intialPictures } = await request(server)
            .get('/pictures')
            .expect(200);
        expect(intialPictures.pictures.length).toEqual(0);

        // post a few pictures
        for (const picture of expectedPictures) {
            const payload: PostPictureInput = {
                name: picture.name,
                createdBy: picture.createdBy,
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
        expect(pictures.pictures.length).toEqual(expectedPictures.length);

        // set up to get an individual picture
        const ENDPOINT = 'http://127.0.0.1:6543/';
        const socket = io_package(ENDPOINT);

        const receivedPictures = new Map<number, Raster>();

        // pictures.pictures.forEach(async (picture: PictureDatabaseShape) => {
        for (const picture of pictures.pictures) {
            socket.removeListener('picture_response');
            socket.on(
                'picture_response',
                (pictureResponse: PictureResponse) => {
                    setReceivedRaster(
                        pictureResponse,
                        picture.id,
                        receivedPictures
                    );
                }
            );
            // TODO probably rename to join_picture_request
            socket.emit('picture_request', {
                filename: picture.filename,
            });

            await new Promise((resolve) => setTimeout(resolve, 1000));

            expect(receivedPictures.has(picture.id)).toBe(true);
            console.log('TJTAG end');
        }

        socket.close();

        // these will be in the start listening to a picture flow
        //        socket.removeListener('server_to_client_update');
        //        socket.on(
        //            'server_to_client_update',
        //            currentPictureService.handleReceivedUpdate
        //        );
        //
        //        if (currentPicture) {
        //            socket.emit('picture_request', {
        //                filename: currentPicture.filename,
        //            });
        //        }
        // TODO add to this this test, needs to use socket request
        // in order to properly synchronize with updates
    });

    afterAll(() => {
        io.close();
        server.close();
    });

    const setReceivedRaster = (
        pictureResponse: PictureResponse,
        id: number,
        receivedPictures: Map<number, Raster>
    ) => {
        console.log(`TJTAG - receiving picture_response for ${id}`);
        receivedPictures.set(
            id,
            new Raster(
                pictureResponse.width,
                pictureResponse.height,
                pictureResponse.data
            )
        );
    };
});
