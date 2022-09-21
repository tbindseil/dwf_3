import '../App.css';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { PutClientOutput } from 'dwf-3-models-tjb';

const ENDPOINT = 'http://127.0.0.1:6543/';

function Canvas() {
    const [imgDataState, setImgDataState] = useState(new ImageData(200, 200));

    const filename = 'picture_to_be_created_tj_Wed Sep 14 2022 09:26:44 GMT-0600 (Mountain Daylight Time).png';
    const redFileName = 'red.png'; // 0xff, 0x00, 0x00, 0xff
    const greenFileName = 'green.png'; // 0x00, 0xff, 0x00, 0xff
    const blueFileName = 'blue.png'; // 0x00, 0x00, 0xff, 0xff
    const socket = io(ENDPOINT);
    const requestPictureFunction = () => {
        socket.emit('picture_request', {filename: blueFileName});
    };

    socket.on('picture_response', (response: PutClientOutput) => {
        console.log(`response is: ${response}`);
        console.log(`stringified response is: ${JSON.stringify(response)}`);
        console.log(`byteLength is: ${response.data.byteLength}`);
        console.log(`isView is: ${ArrayBuffer.isView(response)}`);
        const dv = new DataView(response.data);
        console.log(`now, isView? ${ArrayBuffer.isView(dv)}`);
        const firstByte = dv.getUint8(1);
        console.log(`first byte is: ${firstByte}`);

        console.log(`width is: ${response.width}`);
        console.log(`height is: ${response.height}`);

        let canvas = document.getElementById('canvas') as HTMLCanvasElement;
        let ctx = canvas!.getContext('2d');
        let imgData = ctx!.getImageData(0, 0, response.width, response.height); // Ahh, using !
        console.log(`dv.length is: ${dv.byteLength} and imgData.data.length is: ${imgData.data.length}`);
        const howManyToPrint = 16;
        for (let i = 0; i < imgData.data.length; ++i) {
            if (i < howManyToPrint) {
                console.log(`i is: ${i} and dv.getUint8(i) is ${dv.getUint8(i)}`);
            }
            if (dv.getUint8(i) == 128) {
                imgData.data[i] = 255;
            } else {
                imgData.data[i] = dv.getUint8(i);
            }
        }
        ctx!.putImageData(imgData, 0, 0);
        console.log(`done putting data`);

        setImgDataState(imgData);

        /*
        console.log('ummm');
        const bytesToPrint = 12;
        for (let i = 0; i++; i < bytesToPrint) {
            console.log(`byte num ${i} is ${response[i]}`);
        }
        console.log('here');
        response.forEach(byte => console.log(`byte is: ${byte}`));
        console.log('there');
        */
        // response.forEach(byte => console.log(`byte is: 

        // https://stackoverflow.com/questions/26692575/html5-canvas-fastest-way-to-display-an-array-of-pixel-colors-on-the-screen
        // ctx2.drawImage(c1, 0, 0, 400, 300);

    });
    useEffect(() => {
        
    }, []);
                // It's <time dateTime={response}>{response}</time>

    return (
        <div className="Canvas">
            canvas works
            <p>
                its time to show the raster
            </p>
            <button onClick={requestPictureFunction} >
                request picture
            </button>
            <canvas id='canvas'>
            </canvas>

        </div>
    );
}

export default Canvas;
