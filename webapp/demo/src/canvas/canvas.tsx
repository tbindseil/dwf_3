import '../App.css';
import { useCallback, useContext, useEffect, useState, useRef } from 'react';
import { PictureResponse, PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import { SocketContext } from '../context/socket';

function Canvas() {
    const socket = useContext(SocketContext);

    console.log('creating raster state');
    const [raster, setRaster] = useState(new Raster(0, 0, new ArrayBuffer(0)));
    console.log(`after creating raster state and w h are ${raster.width} ${raster.height}`);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // TODO get all files and pick one, then leave and disconnect cleanly
    const filename = 'picture_to_be_created_tj_Wed Sep 14 2022 09:26:44 GMT-0600 (Mountain Daylight Time).png';
    const redFilename = 'red.png';
    const greenFilename = 'green.png';
    const blueFilename = 'blue.png';
    const requestPictureFunction = (filename: string) => {
        socket.emit('picture_request', {filename: filename});
    };

    // this thing's gotta be in a library so the picture_sync_client can use it as well
    const updateImageData = useCallback((pixelUpdate: PixelUpdate): void => {
        const saved = raster.saveBufferForDebug();
        console.log(`pixelUpdate is: ${JSON.stringify(pixelUpdate)}`);
        raster.handlePixelUpdate(pixelUpdate);
        console.log('here');
        raster.printBufferDifference(saved);
        updateCanvas();
    }, [raster]);

    const updateCanvas = useCallback((): void => {
        let canvas = document.getElementById('canvas') as HTMLCanvasElement;
        let ctx = canvas!.getContext('2d');
        // TODO should raster provide buffer? or should raster take in context and put image data?
        console.log(`in updateCanvas and w h are ${raster.width} and ${raster.height}`);
        const id = new ImageData(raster.getBuffer(), raster.width, raster.height);
        ctx!.putImageData(id, 0, 0);
    }, [raster]);

    const server_to_client_update_callback = useCallback((pixelUpdate: PixelUpdate): void => {
        console.log(`server_to_client_update and raster w h is ${raster.width} ${raster.height}`);
        updateImageData(pixelUpdate);
    }, [updateImageData])

    const picture_response_callback = useCallback((pictureResponse: PictureResponse) => {
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
        console.log('putting image data');
        ctx!.putImageData(nextImageData, 0, 0);

        console.log(`(just put image data) setting nextRaster w and h to ${pictureResponse.width} and ${pictureResponse.height}`);
        const nextRaster = new Raster(pictureResponse.width, pictureResponse.height, nextImageData.data);
        setRaster(nextRaster);
    }, [setRaster]);

    useEffect(() => {
        console.log(`resetting socket handlers: raster w and h are: ${raster.width} ${raster.height}`);
        socket.on('picture_response', picture_response_callback);

        socket.on('server_to_client_update', server_to_client_update_callback);
    }, [picture_response_callback, server_to_client_update_callback]);

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
