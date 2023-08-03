import '../App.css';
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentPictureService } from '../services/current_picture_service';
import { blotRasterToCanvas } from './utils';

function Canvas() {
  const currentPictureService = useCurrentPictureService();
  const picture = currentPictureService.getCurrentPicture();

  const navigate = useNavigate();
  const go = (url: string) => {
    navigate(url);
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const raster = currentPictureService.getCurrentRaster();
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;

      blotRasterToCanvas(raster, canvas);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // TJTAG
  // so what's next?
  // settings? no , they belong to users
  // so users is next...
  // yikes that's a big one
  // anything before that?
  // yeah, actually respect the pictures
  // so,
  //  open the picture instead of just a random one
  //  save the picture as its updated
  // I guess I still need to test current picture service...
  const click = useCallback((event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
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

    currentPictureService.handleUserUpdate(pixelUpdate);
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
      <p>
        <button
          onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            void event;
            currentPictureService.checkSocketStatus();
          }}
        >
          Check socket status
        </button>
      </p>
      <br />
      <canvas id='canvas' ref={canvasRef} onClick={click}></canvas>
    </div>
  );
}

export default Canvas;
