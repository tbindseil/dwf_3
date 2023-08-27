import '../App.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentPictureService } from '../services/current_picture_service';
import { blotRasterToCanvas } from './utils';
import { PixelUpdate } from 'dwf-3-models-tjb';

function Canvas() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

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
        // console.log('raster width or height is 0, not updating');
        return;
      }

      setWidth(raster.width);
      setHeight(raster.height);

      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      blotRasterToCanvas(raster, canvas);
    }, 30);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const click = useCallback((event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    // for now just gonna do white pixels
    const x = event.pageX - (canvasRef.current?.offsetLeft ?? 0);
    const y = event.pageY - (canvasRef.current?.offsetTop ?? 0);
    // update current picture via current picture service
    const pixelUpdate = new PixelUpdate({
      filename: picture.filename,
      createdBy: 'tj', // TODO usernames
      x,
      y,
      red: 255,
      green: 255,
      blue: 255,
    });
    console.log('TJTAG is it a function when seinding it?');
    console.log(`${pixelUpdate.updateRaster}`);
    console.log('TJTAG done');

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
      <canvas
        id='canvas'
        ref={canvasRef}
        onClick={click}
        width={Math.max(100, width)}
        height={Math.max(100, height)}
      ></canvas>
    </div>
  );
}

export default Canvas;
