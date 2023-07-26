import '../App.css';
import { useCallback, useContext, useEffect, useState, useRef } from 'react';
import { PictureResponse, PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import { SocketContext } from '../context/socket';
import { useNavigate, useLocation } from 'react-router-dom';

// TJTAG TODO
// well first problem, can't pass state (and doesn't handle no state well)
// so, I should change it from state that's passed in global app state
// now comes the brainstorm options and pros and cons
// 1. add it to picture service
//   this would involve some sort of setting the current picture in that object
//   (upon selection in the PicturesScreen), and then here we would just get current
//   picture from picture service.
//   pros:
//   seems pretty easy
//   cons:
//   breaks the picture service's current role as api calls only
// 2. add a new service (current_picture_service)
//   this would handle setting the current picture
//   and fetching its contents
//   and even live updating from the current user and other users
//
// I like 2 because it gives me a chance to take my time and do things "right"
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

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas!.getContext('2d');
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

  const pictureResponseCallback = useCallback(
    (pictureResponse: PictureResponse) => {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;

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
    socket.on('picture_response', pictureResponseCallback);

    socket.removeListener('server_to_client_update');
    socket.on('server_to_client_update', updateImageData);
  }, [socket, pictureResponseCallback]);

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
