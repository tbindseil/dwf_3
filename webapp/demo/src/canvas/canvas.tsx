import '../App.css';
import { useContext, useState, useRef } from 'react';
import { PictureResponse, PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import { SocketContext } from '../context/socket';

function Canvas() {
    const socket = useContext(SocketContext);

    const [raster, setRaster] = useState(new Raster(0, 0, new ArrayBuffer(0)));

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // TODO get all files and pick one, then leave and disconnect cleanly
    const filename = 'picture_to_be_created_tj_Wed Sep 14 2022 09:26:44 GMT-0600 (Mountain Daylight Time).png';
    const redFilename = 'red.png';
    const greenFilename = 'green.png';
    const blueFilename = 'blue.png';
    const requestPictureFunction = (filename: string) => {
        socket.emit('picture_request', {filename: filename});
    };

    socket.on('picture_response', (pictureResponse: PictureResponse) => {
        // const nextRaster = new Raster(pictureResponse.width, pictureResponse.height, pictureResponse.data);
        // nextImageData.data is readonly, that makes it difficult to do what i want to do
        // maybe i can pass it as the array when creating the raster object?

        const asArray = new Uint8Array(pictureResponse.data);

        let canvas = document.getElementById('canvas') as HTMLCanvasElement;

        // TODO maybe I can have a canvas component that takes in a Raster?
        // or the canvas component handles all this?
        canvas.width = pictureResponse.width;
        canvas.height = pictureResponse.height;

        let ctx = canvas!.getContext('2d');
        let nextImageData = ctx!.getImageData(0, 0, pictureResponse.width, pictureResponse.height); // Ahh, using !
        for (let i = 0; i < nextImageData.data.length; ++i) {
            nextImageData.data[i] = asArray[i];
        }
        // TODO can i just wholesale save this incoming chunk of mem? I think that is what the raster class will do
        ctx!.putImageData(nextImageData, 0, 0);

        const nextRaster = new Raster(pictureResponse.width, pictureResponse.height, nextImageData.data);
        setRaster(nextRaster);
    });

    // this thing's gotta be in a library so the picture_sync_client can use it as well
    const updateImageData = (pixelUpdate: PixelUpdate): void => {
        raster.handlePixelUpdate(pixelUpdate);
        updateCanvas();
    };

    const updateCanvas = (): void => {
        let canvas = document.getElementById('canvas') as HTMLCanvasElement;
        let ctx = canvas!.getContext('2d');
        // TODO should raster provide buffer? or should raster take in context and put image data?
        const id = new ImageData(raster.getBuffer(), raster.width, raster.height);
        ctx!.putImageData(id, 0, 0);
    };

    socket.on('server_to_client_update', (pixelUpdate: PixelUpdate): void => {
        updateImageData(pixelUpdate);
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
                    onClick={(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
                        // for now just gonna do black pixels
                        const x = event.clientX - (canvasRef.current?.offsetLeft ?? 0);
                        const y = event.clientY - (canvasRef.current?.offsetTop ?? 0);
                        const pixelUpdate = {
                            filename: blueFilename, // TJTAG TODO this is hard coded
                            createdBy: 'tj',
                            x: x,
                            y: y,
                            red: 255,
                            green: 255,
                            blue: 255,
                        };

                        updateImageData(pixelUpdate);

                        socket.emit('client_to_server_udpate', pixelUpdate);
                    }}>
            </canvas>

        </div>
    );
}

export default Canvas;
