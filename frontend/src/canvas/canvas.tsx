import '../App.css';
import { useCallback, useContext, useEffect, useState, useRef } from 'react';
import { PictureResponse, PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import { SocketContext } from '../context/socket';
import { useNavigate } from 'react-router-dom';
import { useCurrentPictureService } from '../services/current_picture_service';

function Canvas() {
  const currentPictureService = useCurrentPictureService();
  const picture = currentPictureService.getCurrentPicture();

  const socket = useContext(SocketContext);

  const navigate = useNavigate();
  const go = (url: string) => {
    navigate(url);
  };

  const [raster, setRaster] = useState(new Raster(0, 0, new ArrayBuffer(0)));

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // create an image that has the new raster and put it on the canvas
  const updateCanvas = useCallback((): void => {
    if (raster.width === 0 || raster.height === 0) {
      console.log('raster width or height is 0, not updating');
      return;
    }

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas!.getContext('2d');
    const id = new ImageData(raster.getBuffer(), raster.width, raster.height);
    ctx!.putImageData(id, 0, 0);
  }, [raster]);

  // update the raster, then update the canvas
  const updateImageData = useCallback(
    (pixelUpdate: PixelUpdate): void => {
      raster.handlePixelUpdate(pixelUpdate);
      updateCanvas();
    },
    [raster, updateCanvas],
  );

  // gets called when we get the raster back
  // this needs to go in currentPictureService
  const pictureResponseCallback = useCallback(
    (pictureResponse: PictureResponse) => {
      console.log('TJTAG when does this get called?');
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;

      canvas.width = pictureResponse.width;
      canvas.height = pictureResponse.height;

      // or maybe only this part...
      const nextRaster = new Raster(
        pictureResponse.width,
        pictureResponse.height,
        pictureResponse.data,
      );
      setRaster(nextRaster);

      updateCanvas();
    },
    [setRaster, updateCanvas],
  );

  const click = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      // for now just gonna do white pixels
      const x = event.pageX - (canvasRef.current?.offsetLeft ?? 0);
      const y = event.pageY - (canvasRef.current?.offsetTop ?? 0);
      // update current picture via current picture service
      const pixelUpdate = {
        filename: picture.filename,
        createdBy: 'tj', // TODO usernames
        x: x,
        y: y,
        red: 255,
        green: 255,
        blue: 255,
      };

      updateImageData(pixelUpdate);

      socket.emit('client_to_server_udpate', pixelUpdate);
    },
    [updateImageData, socket],
  );

  // setup socket handlers
  useEffect(() => {
    socket.removeListener('picture_response');
    socket.on('picture_response', pictureResponseCallback);

    socket.removeListener('server_to_client_update');
    socket.on('server_to_client_update', updateImageData);
  }, [socket, pictureResponseCallback]);

  // this runs once at the beginning and asks for the raster
  useEffect(() => {
    // I think it needs to be a socket because there is associated bookeeping with updates that happen
    socket.emit('picture_request', { filename: picture.filename });
    return () => {
      socket.emit('unsubscribe', picture.filename);
    };
  }, []);

  return (
    <div className='Canvas'>
      canvas works
      <p>its time to show the raster</p>
      <p>
        <button
          onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            void event;
            go('/pictures');
          }}
        >
          Pictures
        </button>
      </p>
      <p>
        <button
          onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            void event;
            go('/new-picture');
          }}
        >
          New Picture
        </button>
      </p>
      <br />
      <canvas id='canvas' ref={canvasRef} onClick={click}></canvas>
    </div>
  );
}

export default Canvas;
