import '../App.css';
import { useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { PictureResponse, PixelUpdate } from 'dwf-3-models-tjb';

const ENDPOINT = 'http://127.0.0.1:6543/';

function Canvas() {
    const [imageDataState, setimageDataState] = useState(new ImageData(200, 200));
    void imageDataState;

    const [imageWidth, setImageWidth] = useState(0);
    const [imageHeight, setImageHeight] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement>(null);

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
        let imageData = ctx!.getImageData(0, 0, pictureResponse.width, pictureResponse.height); // Ahh, using !
        for (let i = 0; i < imageData.data.length; ++i) {
            // red: 0xff, 0x00, 0x00, 0xff
            // green: 0x00, 0xff, 0x00, 0xff
            // blue: 0x00, 0x00, 0xff, 0xff

            imageData.data[i] = dv.getUint8(i);
        }
        ctx!.putImageData(imageData, 0, 0);

        setImageWidth(pictureResponse.width);
        setImageHeight(pictureResponse.height);

        setimageDataState(imageData);
    });

    socket.on('server_to_client_update', (pixelUpdate: PixelUpdate) => {
        const imageDataOffset = 4 * (pixelUpdate.x * imageWidth + pixelUpdate.y);
        const red = pixelUpdate.red > 255 ? 255 : pixelUpdate.red;
        const green = pixelUpdate.green > 255 ? 255 : pixelUpdate.green;
        const blue = pixelUpdate.blue > 255 ? 255 : pixelUpdate.blue;

        imageDataState.data[imageDataOffset] = red;
        imageDataState.data[imageDataOffset + 1] = green;
        imageDataState.data[imageDataOffset + 2] = blue;
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
            <canvas id='canvas'
                    ref={canvasRef}
                    style={{'width': `${imageWidth}px`, 'height': `${imageHeight}px`}}
                    onClick={(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
                        // console.log(`event is: ${JSON.stringify(event)}`);
                        console.log('event is:');
                        console.log(event);
                        console.log(`canvasRef.current?.offsetLeft is: ${canvasRef.current?.offsetLeft}`);
                        console.log(`canvasRef.current?.offsetTop is: ${canvasRef.current?.offsetTop}`);
                        console.log(`canvasRef.current?.width is: ${canvasRef.current?.width}`);
                        console.log(`canvasRef.current?.height is: ${canvasRef.current?.height}`);
                    }}>
            </canvas>

        </div>
    );
}

export default Canvas;
