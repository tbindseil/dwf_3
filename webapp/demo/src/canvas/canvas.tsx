import '../App.css';
import { useCallback, useContext, useEffect, useState, useRef } from 'react';
import { PictureResponse, PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import { SocketContext } from '../context/socket';

function Canvas() {
    const socket = useContext(SocketContext);

    const [raster, setRaster] = useState(new Raster(0, 0, new ArrayBuffer(0)));

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // TODO get all files and pick one, then leave and unsubscribe cleanly
    const filename = 'picture_to_be_created_tj_Wed Sep 14 2022 09:26:44 GMT-0600 (Mountain Daylight Time).png';
    const redFilename = 'red.png';
    const greenFilename = 'green.png';
    const blueFilename = 'blue.png';

    const requestPictureFunction = (filename: string) => {
        socket.emit('picture_request', {filename: filename});
    };

    const unsubscribeFunction = (filename: string) => {
        socket.emit('unsubscribe', filename);
    }

    const updateCanvas = useCallback((): void => {
        if (raster.width === 0 || raster.height === 0) {
            console.log('raster width or height is 0, not updating');
            return;
        }

        let canvas = document.getElementById('canvas') as HTMLCanvasElement;
        let ctx = canvas!.getContext('2d');
        const id = new ImageData(raster.getBuffer(), raster.width, raster.height);
        ctx!.putImageData(id, 0, 0);
    }, [raster]);

    const updateImageData = useCallback((pixelUpdate: PixelUpdate): void => {
        raster.handlePixelUpdate(pixelUpdate);
        updateCanvas();
    }, [raster, updateCanvas]);

    const picture_response_callback = useCallback((pictureResponse: PictureResponse) => {
        let canvas = document.getElementById('canvas') as HTMLCanvasElement;

        canvas.width = pictureResponse.width;
        canvas.height = pictureResponse.height;

        const nextRaster = new Raster(pictureResponse.width, pictureResponse.height, pictureResponse.data);
        setRaster(nextRaster);

        updateCanvas();
    }, [setRaster, updateCanvas]);

    const click = useCallback((event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        // for now just gonna do white pixels
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
    }, [updateImageData, socket]);

    useEffect(() => {
        // currently, this only covers when initially receiving the raster becasue the raster state updates asynchronously
        // I think it could be used to ping pong though
        updateCanvas();
    }, [raster]);

    useEffect(() => {
        socket.removeListener('picture_response');
        socket.on('picture_response', picture_response_callback);

        socket.removeListener('server_to_client_update');
        socket.on('server_to_client_update', updateImageData);
    }, [socket, picture_response_callback]);

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
            <button onClick={() => { unsubscribeFunction(blueFilename) }} >
                unsubscribe
            </button>
            <canvas id='canvas'
                    ref={canvasRef}
                    onClick={click}>
            </canvas>

        </div>
    );
}

export default Canvas;
