import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function NewPictureScreen() {
  const navigate = useNavigate();
  const go = (url: string) => {
    navigate(url);
  };

  const [createdBy, setCreatedBy] = useState('');
  const [pictureName, setPictureName] = useState('');

  const handleChange = (
    setFunc: (s: string) => void,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFunc(event.target.value);
  };

  // could be a good opportunity to inject this worker function
  // then it could be tested in isolation
  const createPicture = () => {
    fetch('http://localhost:8080/picture', {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ createdBy: createdBy, name: pictureName }),
    })
      .then((result) => result.json())
      .then(
        (result) => console.log(`result is: ${result}`),
        (error) => console.log(`first catch and error is: ${error}`),
      )
      .catch((error) => console.log(`last catch and error is: ${error}`));
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
          void event;
          createPicture();
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
