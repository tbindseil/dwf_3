import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePictureService } from '../../services/picture_service';
import { PictureDatabaseShape } from 'dwf-3-models-tjb';

export function PicturesScreen() {
  const navigate = useNavigate();

  const pictureService = usePictureService();

  const [pictures, setPictures] = useState<PictureDatabaseShape[]>([]);

  const fetchPictures = async () => {
    const result = await pictureService.getPictures({});
    setPictures(result.pictures);
  };

  useEffect(() => {
    fetchPictures();
  }, []);

  const goToPicture = (picture: PictureDatabaseShape) => {
    navigate('/picture', { state: { picture: picture, replace: true } });
  };

  return (
    <div className='Pictures'>
      canvas works
      <h2>Pic Your Pic</h2>
      {pictures.map((picture) => {
        return (
          <button
            key={picture.id}
            onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
              void event;
              goToPicture(picture);
            }}
          >
            {`${picture.name} by ${picture.createdBy}`}
          </button>
        );
      })}
    </div>
  );
}
