import '../App.css';
import { useState } from 'react';
import { io } from 'socket.io-client';
import { PictureResponse } from 'dwf-3-models-tjb';

const ENDPOINT = 'http://127.0.0.1:6543/';

function Canvas() {
    const [imgDataState, setImgDataState] = useState(new ImageData(200, 200));
    // imgDataState;

    const filename = 'picture_to_be_created_tj_Wed Sep 14 2022 09:26:44 GMT-0600 (Mountain Daylight Time).png';
    const redFilename = 'red.png';
    const greenFilename = 'green.png';
    const blueFilename = 'blue.png';
    const socket = io(ENDPOINT);
    const requestPictureFunction = (filename: string) => {
        socket.emit('picture_request', {filename: filename});
    };

    socket.on('picture_response', (pictureResponse: PictureResponse) => {
        const dv = new DataView(pictureResponse.data);

        let canvas = document.getElementById('canvas') as HTMLCanvasElement;
        let ctx = canvas!.getContext('2d');
        let imgData = ctx!.getImageData(0, 0, pictureResponse.width, pictureResponse.height); // Ahh, using !
        for (let i = 0; i < imgData.data.length; ++i) {
            // red: 0xff, 0x00, 0x00, 0xff
            // green: 0x00, 0xff, 0x00, 0xff
            // blue: 0x00, 0x00, 0xff, 0xff

            imgData.data[i] = dv.getUint8(i);
        }
        ctx!.putImageData(imgData, 0, 0);

        setImgDataState(imgData);
    });

    return (
        <div className="Canvas">
            canvas works
            <p>
                its time to show the raster
            </p>
            <button onClick={() => { requestPictureFunction(filename) }} >
                request white picture
            </button>
            <button onClick={() => { requestPictureFunction(redFilename) }} >
                request red picture
            </button>
            <button onClick={() => { requestPictureFunction(greenFilename) }} >
                request green picture
            </button>
            <button onClick={() => { requestPictureFunction(blueFilename) }} >
                request blue picture
            </button>
            <canvas id='canvas'>
            </canvas>

        </div>
    );
}

export default Canvas;
