import '../App.css';
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentPictureService } from '../services/current_picture_service';

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
      if (!raster || raster.width === 0 || raster.height === 0) {
        console.log('raster width or height is 0, not updating');
        return;
      }

      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      const ctx = canvas!.getContext('2d');
      console.log(
        `raster.getBuffer(), raster.width, raster.height is: ${raster.getBuffer()}, ${
          raster.width
        }, ${raster.height}`,
      );
      const id = new ImageData(raster.getBuffer(), raster.width, raster.height);
      ctx!.putImageData(id, 0, 0);
    }, 30);
    return () => clearInterval(interval);
  }, []);

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
      <br />
      <canvas id='canvas' ref={canvasRef} onClick={click}></canvas>
    </div>
  );
}

export default Canvas;
