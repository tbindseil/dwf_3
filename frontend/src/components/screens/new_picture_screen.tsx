import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePictureService } from '../../services/picture_service';

export function NewPictureScreen() {
  const navigate = useNavigate();
  const go = (url: string) => {
    navigate(url);
  };

  const pictureService = usePictureService();

  const [createdBy, setCreatedBy] = useState('');
  const [pictureName, setPictureName] = useState('');

  const handleChange = (
    setFunc: (s: string) => void,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFunc(event.target.value);
  };

  return (
    <div>
      <label htmlFor={'createdBy'}>Created By:</label>
      <input
        type={'text'}
        name={'createdBy'}
        id={'createdBy'}
        value={createdBy}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          handleChange(setCreatedBy, event);
        }}
      />
      <label htmlFor={'pictureName'}>{'Picture Name:'}</label>
      <input
        type={'text'}
        name={'pictureName'}
        id={'pictureName'}
        value={pictureName}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          handleChange(setPictureName, event);
        }}
      />
      <button
        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          event;
          pictureService.createPicture(createdBy, pictureName);
        }}
      >
        Create Picture
      </button>

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
            go('/');
          }}
        >
          Home
        </button>
      </p>
    </div>
  );
}
