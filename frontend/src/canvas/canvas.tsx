import '../App.css';
import { useCallback, useContext, useEffect, useState, useRef } from 'react';
import { PictureResponse, PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import { SocketContext } from '../context/socket';
import { useNavigate, useLocation } from 'react-router-dom';

function Canvas() {
  const location = useLocation();
  const picture = location?.state?.picture; // next thing, new pictures

  const socket = useContext(SocketContext);

  const navigate = useNavigate();
  const go = (url: string) => {
    navigate(url);
  };

  const [raster, setRaster] = useState(new Raster(0, 0, new ArrayBuffer(0)));

  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const updateImageData = useCallback(
    (pixelUpdate: PixelUpdate): void => {
      raster.handlePixelUpdate(pixelUpdate);
      updateCanvas();
    },
    [raster, updateCanvas],
  );

  const picture_response_callback = useCallback(
    (pictureResponse: PictureResponse) => {
      let canvas = document.getElementById('canvas') as HTMLCanvasElement;

      canvas.width = pictureResponse.width;
      canvas.height = pictureResponse.height;

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

  useEffect(() => {
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
