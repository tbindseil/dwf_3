import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


export function NewPictureScreen() {
    const navigate = useNavigate();
    const go = (url: string) => {
        navigate(url);
    };

    const [createdBy, setCreatedBy] = useState('');
    const [pictureName, setPictureName] = useState('');

    const handleCreatedByChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target;
        const value = target.value;

        setCreatedBy(value);
    };

    const handlePictureNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target;
        const value = target.value;

        setPictureName(value);
    };

    const createPicture = () => {
            fetch('http://localhost:8080/picture', {
                method: 'POST',
                mode: 'cors',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({createdBy: createdBy, name: pictureName})
            })
                .then(result => result.json())
                .then(
                    result => console.log(`result is: ${result}`),
                    error => console.log(`first catch and error is: ${error}`)
                )
                .catch(error => console.log(`last catch and error is: ${error}`));
    };

    return (
        <div>
            <label>
                {'Created By:'}
            </label>
            <input
                type={'text'}
                name={'createdBy'}
                value={createdBy}
                onChange={handleCreatedByChange}/>
            <label>
                {'Picture Name:'}
            </label>
            <input
                type={'text'}
                name={'pictureName'}
                value={pictureName}
                onChange={handlePictureNameChange}/>
            <button
                onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => { void event; createPicture(); }}>
                Create Picture
            </button>

            <p><button onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => { void event; go('/pictures');}}>Pictures</button></p>
            <p><button onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => { void event; go('/new-picture');}}>New Picture</button></p>
        </div>
    );
}
